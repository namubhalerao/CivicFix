import { supabase, isSupabaseConfigured, realtimeBus } from '../lib/supabase';
import {
  CitizenFeedback,
  Issue,
  IssueCategory,
  IssueImage,
  IssueSeverity,
  IssueStatus,
  IssueStatusHistory,
} from '../types';
import { generateReportId } from '../utils/formatters';
import { calculatePriorityScore } from './priorityEngine';
import { authService } from './authService';
import { notificationService } from './notificationService';

const LOCAL_STORAGE_KEY_ISSUES = 'civicfix_issues_db';

// Clean initial state with 0 demo issues
function getInitialSeedIssues(): Issue[] {
  return [];
}

function loadLocalIssues(): Issue[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_ISSUES);
    if (raw) {
      const parsed: Issue[] = JSON.parse(raw);
      // Remove any legacy demo issues
      const cleaned = parsed.filter((i) => !i.id.startsWith('demo-issue-'));
      if (cleaned.length !== parsed.length) {
        saveLocalIssues(cleaned);
      }
      return cleaned;
    }
  } catch {
    // fallback
  }
  return [];
}

function saveLocalIssues(issues: Issue[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ISSUES, JSON.stringify(issues));
  } catch {
    // ignore
  }
}

export const issueService = {
  /**
   * Upload image file to Supabase Storage or persistent Object URL
   */
  async uploadImage(file: File): Promise<string> {
    if (isSupabaseConfigured) {
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('issue-images')
          .upload(`reports/${filename}`, file);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('issue-images')
            .getPublicUrl(`reports/${filename}`);
          if (data?.publicUrl) return data.publicUrl;
        }
      } catch (err) {
        console.warn('Storage upload fallback:', err);
      }
    }

    // Convert file to Base64/DataURL for immediate persistence and offline reliability
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Submit a new civic issue report
   */
  async submitReport(params: {
    category: IssueCategory;
    title: string;
    description: string;
    address: string;
    landmark?: string;
    latitude: number;
    longitude: number;
    severity: IssueSeverity;
    peopleAffected: number;
    imageUrl?: string;
  }): Promise<Issue> {
    const currentUser = await authService.getCurrentUser();
    const citizenId = currentUser ? currentUser.id : 'guest-user';
    const citizenName = currentUser ? currentUser.name : 'Anonymous Citizen';
    const citizenEmail = currentUser ? currentUser.email : undefined;

    // Calculate priority using Smart Priority Engine
    const priority = calculatePriorityScore(
      params.category,
      params.severity,
      params.peopleAffected,
      `${params.address} ${params.landmark || ''}`
    );

    const reportId = generateReportId();
    const issueId = `cf-issue-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const images: IssueImage[] = [];
    if (params.imageUrl) {
      images.push({
        id: `img-${Date.now()}`,
        issue_id: issueId,
        image_url: params.imageUrl,
        image_type: 'REPORT',
        uploaded_by: citizenId,
        created_at: nowIso,
      });
    }

    const initialHistory: IssueStatusHistory = {
      id: `hist-${Date.now()}`,
      issue_id: issueId,
      old_status: null,
      new_status: 'Submitted',
      changed_by: citizenId,
      changed_by_name: citizenName,
      note: 'Report submitted by citizen via mobile/web client.',
      created_at: nowIso,
    };

    const newIssue: Issue = {
      id: issueId,
      report_id: reportId,
      citizen_id: citizenId,
      citizen_name: citizenName,
      citizen_email: citizenEmail,
      category: params.category,
      title: params.title.trim(),
      description: params.description.trim(),
      address: params.address.trim(),
      landmark: params.landmark?.trim(),
      latitude: params.latitude,
      longitude: params.longitude,
      severity: params.severity,
      people_affected: params.peopleAffected,
      priority_score: priority.score,
      priority_level: priority.level,
      priority_explanation: priority.explanation,
      status: 'Submitted',
      images,
      status_history: [initialHistory],
      created_at: nowIso,
      updated_at: nowIso,
    };

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('issues').insert([{
          id: newIssue.id,
          report_id: newIssue.report_id,
          citizen_id: citizenId === 'guest-user' ? null : citizenId,
          citizen_name: citizenName,
          citizen_email: citizenEmail,
          category: newIssue.category,
          title: newIssue.title,
          description: newIssue.description,
          address: newIssue.address,
          landmark: newIssue.landmark,
          latitude: newIssue.latitude,
          longitude: newIssue.longitude,
          severity: newIssue.severity,
          people_affected: newIssue.people_affected,
          priority_score: newIssue.priority_score,
          priority_level: newIssue.priority_level,
          priority_explanation: newIssue.priority_explanation,
          status: newIssue.status,
        }]);

        if (images.length > 0) {
          await supabase.from('issue_images').insert(
            images.map((img) => ({
              id: img.id,
              issue_id: newIssue.id,
              image_url: img.image_url,
              image_type: img.image_type,
              uploaded_by: citizenId === 'guest-user' ? null : citizenId,
            }))
          );
        }

        await supabase.from('issue_status_history').insert([{
          id: initialHistory.id,
          issue_id: newIssue.id,
          old_status: null,
          new_status: 'Submitted',
          changed_by: citizenId === 'guest-user' ? null : citizenId,
          changed_by_name: citizenName,
          note: initialHistory.note,
        }]);
      } catch (err) {
        console.warn('Supabase insert issue error:', err);
      }
    }

    // Update local database
    const issues = loadLocalIssues();
    issues.unshift(newIssue);
    saveLocalIssues(issues);

    // Award +50 civic points for submitting report
    if (currentUser) {
      await authService.awardPoints(currentUser.id, 50);
      await notificationService.createNotification({
        userId: currentUser.id,
        issueId: newIssue.id,
        reportId: newIssue.report_id,
        title: 'Report Submitted 🎉',
        message: `Your report ${newIssue.report_id} was submitted successfully! +50 Civic Points awarded.`,
        type: 'point_award',
      });
    }

    // Broadcast Realtime Event
    realtimeBus.emit('new_issue', newIssue);
    realtimeBus.emit('issues_list_changed', issues);

    return newIssue;
  },

  /**
   * Get all issues (with optional filter parameters)
   */
  async getIssues(filter?: {
    status?: IssueStatus | 'All';
    priority?: string | 'All';
    category?: IssueCategory | 'All';
    search?: string;
  }): Promise<Issue[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('issues').select('*').order('created_at', { ascending: false });

        if (filter?.status && filter.status !== 'All') {
          query = query.eq('status', filter.status);
        }
        if (filter?.priority && filter.priority !== 'All') {
          query = query.eq('priority_level', filter.priority);
        }
        if (filter?.category && filter.category !== 'All') {
          query = query.eq('category', filter.category);
        }
        if (filter?.search && filter.search.trim()) {
          const q = filter.search.trim();
          query = query.or(`report_id.ilike.%${q}%,title.ilike.%${q}%,address.ilike.%${q}%`);
        }

        const { data: dbIssues, error } = await query;
        if (!error && dbIssues && dbIssues.length > 0) {
          // Fetch images and status history for these issues
          const issueIds = dbIssues.map((i: any) => i.id);
          const [imgsRes, histRes, fbRes] = await Promise.all([
            supabase.from('issue_images').select('*').in('issue_id', issueIds),
            supabase.from('issue_status_history').select('*').in('issue_id', issueIds).order('created_at', { ascending: true }),
            supabase.from('feedback').select('*').in('issue_id', issueIds),
          ]);

          const imagesMap: Record<string, IssueImage[]> = {};
          (imgsRes.data || []).forEach((img: any) => {
            if (!imagesMap[img.issue_id]) imagesMap[img.issue_id] = [];
            imagesMap[img.issue_id].push(img);
          });

          const historyMap: Record<string, IssueStatusHistory[]> = {};
          (histRes.data || []).forEach((h: any) => {
            if (!historyMap[h.issue_id]) historyMap[h.issue_id] = [];
            historyMap[h.issue_id].push(h);
          });

          const feedbackMap: Record<string, CitizenFeedback> = {};
          (fbRes.data || []).forEach((fb: any) => {
            feedbackMap[fb.issue_id] = fb;
          });

          const combined: Issue[] = dbIssues.map((i: any) => ({
            ...i,
            images: imagesMap[i.id] || [],
            status_history: historyMap[i.id] || [],
            feedback: feedbackMap[i.id],
          }));

          return combined;
        }
      } catch (err) {
        console.warn('Supabase getIssues error, using local fallback:', err);
      }
    }

    let list = loadLocalIssues();

    if (filter) {
      if (filter.status && filter.status !== 'All') {
        list = list.filter((i) => i.status === filter.status);
      }
      if (filter.priority && filter.priority !== 'All') {
        list = list.filter((i) => i.priority_level === filter.priority);
      }
      if (filter.category && filter.category !== 'All') {
        list = list.filter((i) => i.category === filter.category);
      }
      if (filter.search && filter.search.trim()) {
        const q = filter.search.toLowerCase().trim();
        list = list.filter(
          (i) =>
            i.report_id.toLowerCase().includes(q) ||
            i.title.toLowerCase().includes(q) ||
            i.address.toLowerCase().includes(q) ||
            (i.landmark && i.landmark.toLowerCase().includes(q))
        );
      }
    }

    return list;
  },

  /**
   * Get issue by Report ID (e.g. CF-20260830-1082) or internal UUID
   */
  async getIssueByReportIdOrId(idOrReportId: string): Promise<Issue | null> {
    const clean = idOrReportId.trim().toUpperCase();

    if (isSupabaseConfigured) {
      try {
        const { data: dbIssue, error } = await supabase
          .from('issues')
          .select('*')
          .or(`report_id.eq.${clean},id.eq.${idOrReportId}`)
          .maybeSingle();

        if (!error && dbIssue) {
          const [imgsRes, histRes, fbRes] = await Promise.all([
            supabase.from('issue_images').select('*').eq('issue_id', dbIssue.id),
            supabase.from('issue_status_history').select('*').eq('issue_id', dbIssue.id).order('created_at', { ascending: true }),
            supabase.from('feedback').select('*').eq('issue_id', dbIssue.id).maybeSingle(),
          ]);

          return {
            ...dbIssue,
            images: imgsRes.data || [],
            status_history: histRes.data || [],
            feedback: fbRes.data || undefined,
          };
        }
      } catch (err) {
        console.warn('Supabase getIssueByReportIdOrId error:', err);
      }
    }

    const list = loadLocalIssues();
    const match = list.find(
      (i) => i.report_id.toUpperCase() === clean || i.id === idOrReportId
    );
    return match || null;
  },

  /**
   * Get issues submitted by specific citizen
   */
  async getIssuesByCitizen(citizenId: string): Promise<Issue[]> {
    if (isSupabaseConfigured && !citizenId.startsWith('user-') && !citizenId.startsWith('guest-')) {
      try {
        const { data: dbIssues, error } = await supabase
          .from('issues')
          .select('*')
          .eq('citizen_id', citizenId)
          .order('created_at', { ascending: false });

        if (!error && dbIssues && dbIssues.length > 0) {
          const issueIds = dbIssues.map((i: any) => i.id);
          const [imgsRes, histRes] = await Promise.all([
            supabase.from('issue_images').select('*').in('issue_id', issueIds),
            supabase.from('issue_status_history').select('*').in('issue_id', issueIds),
          ]);

          const imagesMap: Record<string, IssueImage[]> = {};
          (imgsRes.data || []).forEach((img: any) => {
            if (!imagesMap[img.issue_id]) imagesMap[img.issue_id] = [];
            imagesMap[img.issue_id].push(img);
          });

          const historyMap: Record<string, IssueStatusHistory[]> = {};
          (histRes.data || []).forEach((h: any) => {
            if (!historyMap[h.issue_id]) historyMap[h.issue_id] = [];
            historyMap[h.issue_id].push(h);
          });

          return dbIssues.map((i: any) => ({
            ...i,
            images: imagesMap[i.id] || [],
            status_history: historyMap[i.id] || [],
          }));
        }
      } catch (err) {
        console.warn('Supabase getIssuesByCitizen error:', err);
      }
    }

    const list = loadLocalIssues();
    return list.filter((i) => i.citizen_id === citizenId);
  },

  /**
   * Admin Status Update with Realtime broadcast & Point rewards
   */
  async updateStatus(params: {
    issueId: string;
    newStatus: IssueStatus;
    note?: string;
    adminName?: string;
  }): Promise<Issue> {
    const issues = loadLocalIssues();
    const idx = issues.findIndex((i) => i.id === params.issueId || i.report_id === params.issueId);
    
    const current = idx !== -1 ? issues[idx] : await this.getIssueByReportIdOrId(params.issueId);
    if (!current) {
      throw new Error('Civic issue not found.');
    }

    const oldStatus = current.status;
    const nowIso = new Date().toISOString();

    const historyRecord: IssueStatusHistory = {
      id: `hist-${Date.now()}`,
      issue_id: current.id,
      old_status: oldStatus,
      new_status: params.newStatus,
      changed_by_name: params.adminName || 'Admin Command',
      note: params.note || `Status updated from ${oldStatus} to ${params.newStatus}`,
      created_at: nowIso,
    };

    const updatedIssue: Issue = {
      ...current,
      status: params.newStatus,
      updated_at: nowIso,
      resolved_at: params.newStatus === 'Resolved' ? nowIso : current.resolved_at,
      status_history: [...(current.status_history || []), historyRecord],
    };

    if (idx !== -1) {
      issues[idx] = updatedIssue;
      saveLocalIssues(issues);
    }

    // Update Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('issues')
          .update({
            status: params.newStatus,
            updated_at: nowIso,
            resolved_at: params.newStatus === 'Resolved' ? nowIso : current.resolved_at,
          })
          .eq('id', current.id);

        await supabase.from('issue_status_history').insert([{
          id: historyRecord.id,
          issue_id: current.id,
          old_status: oldStatus,
          new_status: params.newStatus,
          changed_by_name: params.adminName || 'Admin Command',
          note: historyRecord.note,
        }]);
      } catch (err) {
        console.warn('Supabase update status error:', err);
      }
    }

    // Give points if verified (+50) or resolved (+100)
    if (current.citizen_id && current.citizen_id !== 'guest-user') {
      let pointsToAdd = 0;
      if (params.newStatus === 'Verified' && oldStatus !== 'Verified') {
        pointsToAdd = 50;
      } else if (params.newStatus === 'Resolved' && oldStatus !== 'Resolved') {
        pointsToAdd = 100;
      }

      if (pointsToAdd > 0) {
        await authService.awardPoints(current.citizen_id, pointsToAdd);
      }

      // Notify citizen in real time
      await notificationService.createNotification({
        userId: current.citizen_id,
        issueId: current.id,
        reportId: current.report_id,
        title: `Status Update: ${params.newStatus}`,
        message: `Your report ${current.report_id} status changed to ${params.newStatus}. ${params.note || ''}`,
        type: 'status_update',
      });
    }

    // Broadcast Realtime updates!
    realtimeBus.emit('issue_updated', updatedIssue);
    realtimeBus.emit(`issue_${updatedIssue.id}`, updatedIssue);
    realtimeBus.emit(`issue_${updatedIssue.report_id}`, updatedIssue);
    realtimeBus.emit('issues_list_changed', issues);

    return updatedIssue;
  },

  /**
   * Upload Before / After Resolution Proof images
   */
  async addResolutionProof(params: {
    issueId: string;
    imageUrl: string;
    imageType: 'BEFORE' | 'AFTER';
  }): Promise<Issue> {
    const issues = loadLocalIssues();
    const idx = issues.findIndex((i) => i.id === params.issueId || i.report_id === params.issueId);
    
    const current = idx !== -1 ? issues[idx] : await this.getIssueByReportIdOrId(params.issueId);
    if (!current) throw new Error('Issue not found');

    const newImage: IssueImage = {
      id: `proof-${Date.now()}`,
      issue_id: current.id,
      image_url: params.imageUrl,
      image_type: params.imageType,
      created_at: new Date().toISOString(),
    };

    // Filter out existing proof of same type if any
    const otherImages = (current.images || []).filter((img) => img.image_type !== params.imageType);
    const updatedImages = [...otherImages, newImage];

    const updatedIssue: Issue = {
      ...current,
      images: updatedImages,
      updated_at: new Date().toISOString(),
    };

    if (idx !== -1) {
      issues[idx] = updatedIssue;
      saveLocalIssues(issues);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('issue_images').insert([{
          id: newImage.id,
          issue_id: current.id,
          image_url: newImage.image_url,
          image_type: newImage.image_type,
        }]);
      } catch (err) {
        console.warn('Supabase addResolutionProof error:', err);
      }
    }

    realtimeBus.emit('issue_updated', updatedIssue);
    realtimeBus.emit(`issue_${updatedIssue.id}`, updatedIssue);
    realtimeBus.emit(`issue_${updatedIssue.report_id}`, updatedIssue);

    return updatedIssue;
  },

  /**
   * Submit Citizen Feedback
   */
  async submitFeedback(params: {
    issueId: string;
    rating: number;
    comment: string;
  }): Promise<CitizenFeedback> {
    const currentUser = await authService.getCurrentUser();
    const issues = loadLocalIssues();
    const idx = issues.findIndex((i) => i.id === params.issueId || i.report_id === params.issueId);
    
    const issueId = idx !== -1 ? issues[idx].id : params.issueId;

    const feedback: CitizenFeedback = {
      id: `fb-${Date.now()}`,
      issue_id: issueId,
      citizen_id: currentUser ? currentUser.id : 'guest-user',
      citizen_name: currentUser ? currentUser.name : 'Citizen',
      rating: params.rating,
      comment: params.comment.trim(),
      created_at: new Date().toISOString(),
    };

    if (idx !== -1) {
      issues[idx].feedback = feedback;
      saveLocalIssues(issues);
      realtimeBus.emit('issue_updated', issues[idx]);
      realtimeBus.emit(`issue_${issues[idx].id}`, issues[idx]);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('feedback').insert([{
          id: feedback.id,
          issue_id: issueId,
          citizen_id: currentUser?.id && !currentUser.id.startsWith('user-') ? currentUser.id : null,
          citizen_name: feedback.citizen_name,
          rating: feedback.rating,
          comment: feedback.comment,
        }]);
      } catch (err) {
        console.warn('Supabase submitFeedback error:', err);
      }
    }

    return feedback;
  },

  /**
   * Assign Team to an Issue (Admin capability)
   */
  async assignTeam(params: {
    issueId: string;
    teamId: string;
    teamName: string;
    teamLeader?: string;
    teamPhone?: string;
    adminName?: string;
    updateStatusToAssigned?: boolean;
    note?: string;
  }): Promise<Issue> {
    const issues = loadLocalIssues();
    const idx = issues.findIndex((i) => i.id === params.issueId || i.report_id === params.issueId);
    
    const current = idx !== -1 ? issues[idx] : await this.getIssueByReportIdOrId(params.issueId);
    if (!current) {
      throw new Error('Civic issue not found.');
    }

    const nowIso = new Date().toISOString();
    const shouldUpdateStatus = params.updateStatusToAssigned && current.status !== 'Work Started' && current.status !== 'Resolved' && current.status !== 'Closed';
    const newStatus = shouldUpdateStatus ? ('Assigned' as IssueStatus) : current.status;

    const assignmentNote = params.note || `Work assigned to ${params.teamName}${params.teamLeader ? ` (Leader: ${params.teamLeader})` : ''}.`;

    const historyRecord: IssueStatusHistory = {
      id: `hist-${Date.now()}`,
      issue_id: current.id,
      old_status: current.status,
      new_status: newStatus,
      changed_by_name: params.adminName || 'Admin Command',
      note: assignmentNote,
      created_at: nowIso,
    };

    const updatedIssue: Issue = {
      ...current,
      status: newStatus,
      assigned_team_id: params.teamId,
      assigned_team_name: params.teamName,
      assigned_team_leader: params.teamLeader || null,
      assigned_team_phone: params.teamPhone || null,
      assigned_at: nowIso,
      assigned_by: params.adminName || 'Sanjana Dhere (Admin)',
      updated_at: nowIso,
      status_history: [...(current.status_history || []), historyRecord],
    };

    if (idx !== -1) {
      issues[idx] = updatedIssue;
      saveLocalIssues(issues);
    }

    // Update Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('issues')
          .update({
            assigned_team_id: params.teamId,
            assigned_team_name: params.teamName,
            assigned_team_leader: params.teamLeader || null,
            assigned_team_phone: params.teamPhone || null,
            assigned_at: nowIso,
            assigned_by: params.adminName || 'Sanjana Dhere (Admin)',
            status: newStatus,
            updated_at: nowIso,
          })
          .eq('id', current.id);

        await supabase.from('issue_status_history').insert([{
          id: historyRecord.id,
          issue_id: current.id,
          old_status: current.status,
          new_status: newStatus,
          changed_by_name: params.adminName || 'Admin Command',
          note: historyRecord.note,
        }]);
      } catch (err) {
        console.warn('Supabase assignTeam error:', err);
      }
    }

    // Notify citizen
    if (current.citizen_id && current.citizen_id !== 'guest-user') {
      await notificationService.createNotification({
        userId: current.citizen_id,
        issueId: current.id,
        reportId: current.report_id,
        title: `Assigned: ${params.teamName}`,
        message: `Your report ${current.report_id} has been assigned to ${params.teamName}. Team Leader: ${params.teamLeader || 'Officer in Charge'}.`,
        type: 'status_update',
      });
    }

    // Broadcast Realtime Event
    realtimeBus.emit('issue_updated', updatedIssue);
    realtimeBus.emit(`issue_${updatedIssue.id}`, updatedIssue);
    realtimeBus.emit(`issue_${updatedIssue.report_id}`, updatedIssue);
    realtimeBus.emit('issues_list_changed', issues);

    return updatedIssue;
  },

  /**
   * Completely purge all old demo / test issue reports and related records
   */
  async deleteAllOldDemoIssues(): Promise<{ success: boolean; deletedCount: number }> {
    let deletedCount = 0;

    // 1. Supabase Deletion (if configured)
    if (isSupabaseConfigured) {
      try {
        const { data: dbIssues } = await supabase.from('issues').select('id');
        if (dbIssues && dbIssues.length > 0) {
          const idsToDelete = dbIssues.map((i: any) => i.id);
          deletedCount = idsToDelete.length;

          // Delete children first (feedback, status history, images, notifications)
          await supabase.from('feedback').delete().in('issue_id', idsToDelete);
          await supabase.from('issue_status_history').delete().in('issue_id', idsToDelete);
          await supabase.from('issue_images').delete().in('issue_id', idsToDelete);
          await supabase.from('notifications').delete().in('issue_id', idsToDelete);
          await supabase.from('issues').delete().in('id', idsToDelete);

          // Clean images from storage bucket
          try {
            const { data: files } = await supabase.storage.from('issue-images').list('reports');
            if (files && files.length > 0) {
              const filePaths = files.map((f) => `reports/${f.name}`);
              await supabase.storage.from('issue-images').remove(filePaths);
            }
          } catch (storageErr) {
            console.warn('Storage files cleanup notice:', storageErr);
          }
        }
      } catch (err) {
        console.warn('Supabase issue deletion warning:', err);
      }
    }

    // 2. Clear Local Storage
    const local = loadLocalIssues();
    deletedCount = Math.max(deletedCount, local.length);
    saveLocalIssues([]);

    // 3. Clear Notifications linked to demo issues
    try {
      const rawNotifs = localStorage.getItem('civicfix_notifications');
      if (rawNotifs) {
        const notifs = JSON.parse(rawNotifs);
        const filtered = notifs.filter((n: any) => !n.issue_id?.startsWith('demo-issue-') && n.issue_id);
        localStorage.setItem('civicfix_notifications', JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }

    // 4. Emit realtime events
    realtimeBus.emit('issues_list_changed', []);
    realtimeBus.emit('issues_cleared', { deletedCount });

    return { success: true, deletedCount };
  },
};
