import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  FileText,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Trash2,
  Upload,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { IssueCategory, IssueSeverity } from '../types';
import { ISSUE_CATEGORIES, PRIORITY_CONFIG } from '../utils/constants';
import { calculatePriorityScore } from '../services/priorityEngine';
import { issueService } from '../services/issueService';
import { PriorityRadialMeter } from '../components/priority/PriorityRadialMeter';
import { useAuth } from '../contexts/AuthContext';

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Multi-step state: 1 to 6
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [category, setCategory] = useState<IssueCategory>('pothole');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('College Main Gate, North Boulevard');
  const [landmark, setLandmark] = useState('Near Student Quad & Bus Transit Bay');
  const [latitude, setLatitude] = useState(18.5204);
  const [longitude, setLongitude] = useState(73.8567);
  const [isLocating, setIsLocating] = useState(false);

  // Image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
  );

  // Severity & People affected
  const [severity, setSeverity] = useState<IssueSeverity>('critical');
  const [peopleAffected, setPeopleAffected] = useState<number>(100);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState<any | null>(null);

  // Dynamic Priority Engine calculation
  const priorityBreakdown = calculatePriorityScore(
    category,
    severity,
    peopleAffected,
    `${address} ${landmark}`
  );

  // Auto-fill sensible default title when category changes
  const handleSelectCategory = (cat: IssueCategory) => {
    setCategory(cat);
    const catObj = ISSUE_CATEGORIES.find((c) => c.id === cat);
    if (catObj && !title) {
      setTitle(`${catObj.label} near ${address.split(',')[0]}`);
    }
  };

  // GPS Current Location handler with fallback
  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation fallback:', error);
          // Fallback demo coordinates
          setLatitude(18.5204);
          setLongitude(73.8567);
          setAddress('College Main Gate, North Boulevard');
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Image selection handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  // Final Submission
  const handleSubmitReport = async () => {
    setSubmitting(true);
    try {
      let uploadedUrl = imagePreview;
      if (imageFile) {
        uploadedUrl = await issueService.uploadImage(imageFile);
      }

      const issue = await issueService.submitReport({
        category,
        title: title || `${category.replace('_', ' ').toUpperCase()} reported at ${address}`,
        description: description || 'Civic issue reported via CivicFix client.',
        address,
        landmark,
        latitude,
        longitude,
        severity,
        peopleAffected,
        imageUrl: uploadedUrl || undefined,
      });

      setSubmittedIssue(issue);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Issue Category' },
    { num: 2, label: 'Description' },
    { num: 3, label: 'Location' },
    { num: 4, label: 'Photo Evidence' },
    { num: 5, label: 'Severity' },
    { num: 6, label: 'Impact & Score' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <span>🚨</span>
            <span>Report a Community Problem</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Civic Problem Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Provide details below to dispatch municipal repair units with deterministic priority scoring.
          </p>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between overflow-x-auto gap-2">
            {stepsList.map((step) => {
              const isCurrent = currentStep === step.num;
              const isDone = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isCurrent
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                      : isDone
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-cyan-400 text-slate-950'
                        : isDone
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isDone ? '✓' : step.num}
                  </span>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 1: SELECT ISSUE CATEGORY */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white">01 • Select Problem Category</h2>
              <p className="text-xs text-slate-400">
                Choose the category that best describes the civic hazard.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ISSUE_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`p-5 rounded-3xl border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between h-36 ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-950/60 to-slate-900 border-cyan-500 shadow-2xl shadow-cyan-500/20 -translate-y-1.5'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-3xl">{cat.emoji}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{cat.label}</h3>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all"
              >
                <span>Continue to Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DESCRIPTION */}
        {currentStep === 2 && (
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">02 • Issue Title & Description</h2>
              <p className="text-xs text-slate-400">
                Provide specific details to help the maintenance crew prepare tools and materials.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Issue Summary Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep Pothole near Campus Main Gate"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Detailed Description & Hazards
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the severity, damage caused, vehicle issues, or safety hazards..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25"
              >
                <span>Continue to Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LOCATION */}
        {currentStep === 3 && (
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">03 • Incident Location</h2>
                <p className="text-xs text-slate-400">
                  Accurate GPS coordinates enable fast field response.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-all flex items-center gap-2 shrink-0"
              >
                <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Acquiring GPS...' : '📍 Use Current Location'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Street / Campus Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="College Main Gate, North Boulevard"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nearby Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Opposite Student Quad / Bus Bay"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">GPS Coordinates:</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25"
              >
                <span>Continue to Photo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PHOTO UPLOAD */}
        {currentStep === 4 && (
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">04 • Photo Evidence</h2>
              <p className="text-xs text-slate-400">
                Upload a clear picture of the damage or civic obstruction.
              </p>
            </div>

            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 aspect-video group">
                  <img
                    src={imagePreview}
                    alt="Evidence Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove Photo</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-400 font-mono text-center">
                  ✓ Photo attached and ready for Supabase Storage sync
                </p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950/60 hover:bg-slate-900/60 cursor-pointer transition-all">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <div className="text-sm font-bold text-white">Drop your image here</div>
                <div className="text-xs text-slate-400 mt-1">or browse files from your device</div>
                <span className="mt-4 px-4 py-1.5 rounded-xl bg-slate-800 text-cyan-400 text-xs font-semibold border border-slate-700">
                  Select Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25"
              >
                <span>Continue to Severity</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SEVERITY */}
        {currentStep === 5 && (
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">05 • Severity Rating</h2>
              <p className="text-xs text-slate-400">
                How immediate is the danger to pedestrian or vehicular safety?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['low', 'medium', 'high', 'critical'] as IssueSeverity[]).map((sev) => {
                const isSelected = severity === sev;
                const config = PRIORITY_CONFIG[sev];

                return (
                  <div
                    key={sev}
                    onClick={() => setSeverity(sev)}
                    className={`p-5 rounded-3xl border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? `bg-slate-900 ${config.border} shadow-2xl scale-[1.02] ring-2 ring-current ${config.color}`
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-extrabold uppercase tracking-wide">
                        {sev === 'critical' && '🔴 Critical'}
                        {sev === 'high' && '🟠 High'}
                        {sev === 'medium' && '🟡 Medium'}
                        {sev === 'low' && '🟢 Low'}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {sev === 'critical' && 'Immediate life or vehicle damage hazard. Needs instant dispatch.'}
                      {sev === 'high' && 'Major disruption or significant safety hazard.'}
                      {sev === 'medium' && 'Moderate inconvenience or potential risk.'}
                      {sev === 'low' && 'Minor aesthetic or non-urgent maintenance issue.'}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25"
              >
                <span>Continue to Impact & Scoring</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: PEOPLE AFFECTED & SMART PRIORITY CALCULATION */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">06 • Estimated People Affected</h2>
                <p className="text-xs text-slate-400">
                  Approximate daily foot or vehicular traffic impacted by this issue.
                </p>
              </div>

              {/* Segmented control for people affected */}
              <div className="grid grid-cols-4 gap-3">
                {[10, 50, 100, 500].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPeopleAffected(num)}
                    className={`py-3.5 rounded-2xl text-xs font-extrabold transition-all ${
                      peopleAffected === num
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/30 scale-105'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {num === 500 ? '500+ People' : `${num} People`}
                  </button>
                ))}
              </div>
            </div>

            {/* WOW 3: LIVE SMART PRIORITY ENGINE RADIAL COMPONENT */}
            <PriorityRadialMeter breakdown={priorityBreakdown} interactive={true} />

            {/* BIG 🚨 SUBMIT REPORT BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitReport}
                className="group relative w-full p-[2px] rounded-3xl font-extrabold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-rose-500/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 rounded-3xl blur-md opacity-90 group-hover:opacity-100 animate-pulse" />
                <div className="relative w-full py-5 bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 rounded-[22px] text-white flex items-center justify-center gap-3 text-sm sm:text-base tracking-wider uppercase">
                  <span className="text-2xl animate-bounce">🚨</span>
                  <span>{submitting ? 'Submitting & Dispatching...' : 'SUBMIT REPORT'}</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* WOW 19: REPORT SUCCESS MODAL */}
        {submittedIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
                ✅
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-white">Report Submitted!</h2>
                <p className="text-xs text-slate-400">
                  Registered in the municipal dispatch database with live tracking enabled.
                </p>
              </div>

              {/* Report Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Report ID</span>
                  <span className="font-mono font-extrabold text-white text-sm">
                    {submittedIssue.report_id}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Smart Priority</span>
                  <span className="font-extrabold text-rose-400 uppercase">
                    🔴 {submittedIssue.priority_score}/100 Critical
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Dispatch Status</span>
                  <span className="font-bold text-amber-400">🟡 Under Review</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  to={`/track?id=${submittedIssue.report_id}`}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition-transform"
                >
                  Track Live Status →
                </Link>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
