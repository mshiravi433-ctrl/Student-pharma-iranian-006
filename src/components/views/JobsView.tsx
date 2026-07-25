import React, { useState } from 'react';
import { STUDENT_JOBS, JOB_RESOURCES } from '../../data/jobsData';
import { triggerHaptic } from '../../utils/telegram';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Laptop, 
  Building2, 
  ExternalLink,
  Globe
} from 'lucide-react';

export const JobsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredJobs = STUDENT_JOBS.filter(job => {
    if (selectedCategory === 'all') return true;
    return job.category === selectedCategory;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                کار دانشجویی، استخدام و پروژه‌ها
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                متصل به جاب ویژن
              </span>
            </div>
            <p className="text-xs text-slate-300">
              فرصت‌های ویژه دانشجویان پزشکی و دانشگاهی با ساعت کاری منعطف، دورکاری و پاره‌وقت
            </p>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar text-xs font-bold self-stretch sm:self-auto">
          {[
            { id: 'all', label: 'همه آگهی‌ها' },
            { id: 'research', label: 'دستیار پژوهشی و مقاله' },
            { id: 'tutoring', label: 'تدریس آنلاین' },
            { id: 'translation', label: 'ترجمه پزشکی' },
            { id: 'content', label: 'تولید محتوا' },
            { id: 'data-entry', label: 'ورود اطلاعات و SPSS' },
            { id: 'design', label: 'گرافیک و مولتی‌مدیا' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => { triggerHaptic('light'); setSelectedCategory(cat.id); }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reference Job Portals (ما فقط امکان جستجو را داریم و لینک‌دهی به خود مرجع است) */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-extrabold text-emerald-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>سایت‌ها و مراجع اصلی کاریابی (جستجو و انتقال مستقیم به خود سایت مرجع)</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">REFERENCE PORTALS</span>
        </div>
        
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-5 gap-2.5">
          {JOB_RESOURCES.map((res, idx) => (
            <a
              key={idx}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic('light')}
              className="p-3 rounded-2xl bg-white/5 hover:bg-emerald-600/20 border border-white/10 hover:border-emerald-500/50 transition-all flex items-center justify-between group transform active:scale-95"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-lg flex-shrink-0">{res.icon}</span>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {res.name}
                  </h4>
                  <span className="text-[9px] text-slate-400 block line-clamp-1">
                    {res.desc}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 flex-shrink-0 ml-1" />
            </a>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map(job => (
            <div
              key={job.id}
              className="group rounded-3xl glass-card p-5 border border-white/15 hover:border-emerald-500/60 shadow-xl transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{job.companyOrClient}</span>
                  </span>
                  
                  <span className="px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 text-[10px] font-bold">
                    منبع: {job.source}
                  </span>
                </div>

                {/* Job Title */}
                <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                  {job.title}
                </h3>

                {/* Salary & Type */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{job.salary}</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1">
                    {job.type === 'remote' ? <Laptop className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                    <span>
                      {job.type === 'remote' && 'دورکاری (Remote)'}
                      {job.type === 'on-site' && 'حضوری'}
                      {job.type === 'hybrid' && 'ترکیبی (هیبریدی)'}
                      {job.type === 'project' && 'پروژه‌ای'}
                    </span>
                  </span>
                </div>

                {/* Location & description */}
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {job.description}
                </p>

                {/* Requirements */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-extrabold text-slate-400 block">شرایط و مهارت‌های مورد نیاز:</span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{job.postedAgo}</span>
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={job.externalUrl || 'https://jobinja.ir'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerHaptic('light')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
                    title="مشاهده آگهی در سایت مرجع کاریابی"
                  >
                    <span>مشاهده آگهی در سایت مرجع ({job.source})</span>
                    <ExternalLink className="w-4 h-4 text-emerald-200" />
                  </a>
                </div>
              </div>

            </div>
        ))}
      </div>

    </div>
  );
};
