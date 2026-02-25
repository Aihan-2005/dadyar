'use client'

import { useAuthStore } from '@/store/auth.store'
import { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Star,
  Globe,
  Calendar,
  FileText,
} from 'lucide-react'

type Education = {
  id: string
  degree: string
  field: string
  university: string
  year: string
}

type Experience = {
  id: string
  title: string
  company: string
  startYear: string
  endYear: string
  description: string
}

type Skill = {
  id: string
  name: string
  level: number
}

type ProfileData = {
  bio: string
  phone: string
  address: string
  website: string
  specialization: string
  licenseNumber: string
  yearsOfExperience: string
  education: Education[]
  experience: Experience[]
  skills: Skill[]
  languages: string[]
}

const defaultProfile: ProfileData = {
  bio: '',
  phone: '',
  address: '',
  website: '',
  specialization: '',
  licenseNumber: '',
  yearsOfExperience: '',
  education: [],
  experience: [],
  skills: [],
  languages: [],
}

function generateId() {
  return Math.random().toString(36).slice(2)
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const [profile, setProfile] = useState<ProfileData>(defaultProfile)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [tempData, setTempData] = useState<Partial<ProfileData>>({})
  const [newLanguage, setNewLanguage] = useState('')

  const startEdit = (section: string) => {
    setEditingSection(section)
    setTempData({ ...profile })
  }

  const saveEdit = () => {
    setProfile((prev) => ({ ...prev, ...tempData }))
    setEditingSection(null)
    setTempData({})
  }

  const cancelEdit = () => {
    setEditingSection(null)
    setTempData({})
  }

  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      degree: '',
      field: '',
      university: '',
      year: '',
    }
    setTempData((prev) => ({
      ...prev,
      education: [...(prev.education || profile.education), newEdu],
    }))
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setTempData((prev) => ({
      ...prev,
      education: (prev.education || profile.education).map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }))
  }

  const removeEducation = (id: string) => {
    setTempData((prev) => ({
      ...prev,
      education: (prev.education || profile.education).filter((e) => e.id !== id),
    }))
  }

  const addExperience = () => {
    const newExp: Experience = {
      id: generateId(),
      title: '',
      company: '',
      startYear: '',
      endYear: '',
      description: '',
    }
    setTempData((prev) => ({
      ...prev,
      experience: [...(prev.experience || profile.experience), newExp],
    }))
  }

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setTempData((prev) => ({
      ...prev,
      experience: (prev.experience || profile.experience).map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }))
  }

  const removeExperience = (id: string) => {
    setTempData((prev) => ({
      ...prev,
      experience: (prev.experience || profile.experience).filter((e) => e.id !== id),
    }))
  }

  const addSkill = () => {
    const newSkill: Skill = { id: generateId(), name: '', level: 3 }
    setTempData((prev) => ({
      ...prev,
      skills: [...(prev.skills || profile.skills), newSkill],
    }))
  }

  const updateSkill = (id: string, field: keyof Skill, value: string | number) => {
    setTempData((prev) => ({
      ...prev,
      skills: (prev.skills || profile.skills).map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }))
  }

  const removeSkill = (id: string) => {
    setTempData((prev) => ({
      ...prev,
      skills: (prev.skills || profile.skills).filter((s) => s.id !== id),
    }))
  }

  const addLanguage = () => {
    if (!newLanguage.trim()) return
    setProfile((prev) => ({
      ...prev,
      languages: [...prev.languages, newLanguage.trim()],
    }))
    setNewLanguage('')
  }

  const removeLanguage = (lang: string) => {
    setProfile((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }))
  }

  const inputClass =
    'w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white text-right'
  const labelClass = 'block text-xs font-medium text-zinc-600 mb-1 text-right'

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12" dir="rtl">
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="h-28 bg-gradient-to-l from-zinc-800 to-zinc-600" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12 mb-4">
            <div className="w-24 h-24 rounded-2xl bg-zinc-900 border-4 border-white flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">
                {user?.firstName?.[0] || 'و'}
              </span>
            </div>
            <div className="pb-2">
              <h1 className="text-xl font-bold text-zinc-900">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-sm text-zinc-500">
                {profile.specialization || 'وکیل دادگستری'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-zinc-900 flex items-center gap-2">
            <User size={18} />
            اطلاعات پایه
          </h2>
          {editingSection !== 'basic' ? (
            <button
              onClick={() => startEdit('basic')}
              className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-lg px-3 py-1.5"
            >
              <Edit3 size={14} />
              ویرایش
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="flex items-center gap-1 text-xs bg-zinc-900 text-white rounded-lg px-3 py-1.5"
              >
                <Save size={14} />
                ذخیره
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1 text-xs border border-zinc-200 rounded-lg px-3 py-1.5"
              >
                <X size={14} />
                انصراف
              </button>
            </div>
          )}
        </div>

        {editingSection === 'basic' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>تخصص</label>
              <input
                className={inputClass}
                value={tempData.specialization ?? profile.specialization}
                onChange={(e) =>
                  setTempData((p) => ({ ...p, specialization: e.target.value }))
                }
                placeholder="مثلاً: وکیل کیفری، حقوق خانواده"
              />
            </div>
            <div>
              <label className={labelClass}>شماره پروانه وکالت</label>
              <input
                className={inputClass}
                value={tempData.licenseNumber ?? profile.licenseNumber}
                onChange={(e) =>
                  setTempData((p) => ({ ...p, licenseNumber: e.target.value }))
                }
                placeholder="شماره پروانه"
              />
            </div>
            <div>
              <label className={labelClass}>سابقه کار (سال)</label>
              <input
                className={inputClass}
                type="number"
                value={tempData.yearsOfExperience ?? profile.yearsOfExperience}
                onChange={(e) =>
                  setTempData((p) => ({ ...p, yearsOfExperience: e.target.value }))
                }
                placeholder="تعداد سال"
              />
            </div>
            <div>
              <label className={labelClass}>شماره تماس</label>
              <input
                className={inputClass}
                value={tempData.phone ?? profile.phone}
                onChange={(e) =>
                  setTempData((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="09xxxxxxxxx"
              />
            </div>
            <div>
              <label className={labelClass}>وب‌سایت</label>
              <input
                className={inputClass}
                value={tempData.website ?? profile.website}
                onChange={(e) =>
                  setTempData((p) => ({ ...p, website: e.target.value }))
                }
                placeholder="www.example.com"
              />
            </div>
            <div>
              <label className={labelClass}>آدرس دفتر</label>
              <input
                className={inputClass}
                value={tempData.address ?? profile.address}
                onChange={(e) =>
                  setTempData((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="آدرس دفتر"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>بیوگرافی / معرفی</label>
              <textarea
                className={inputClass}
                rows={4}
                value={tempData.bio ?? profile.bio}
                onChange={(e) =>
                  setTempData((p) => ({ ...p, bio: e.target.value }))
                }
                placeholder="خود را معرفی کنید..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.bio && (
              <div className="bg-zinc-50 rounded-xl p-4 text-sm text-zinc-700 leading-7">
                <FileText size={14} className="inline ml-2 text-zinc-400" />
                {profile.bio}
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {profile.specialization && (
                <InfoItem icon={<Briefcase size={14} />} label="تخصص" value={profile.specialization} />
              )}
              {profile.licenseNumber && (
                <InfoItem icon={<Award size={14} />} label="پروانه وکالت" value={profile.licenseNumber} />
              )}
              {profile.yearsOfExperience && (
                <InfoItem icon={<Calendar size={14} />} label="سابقه کار" value={`${profile.yearsOfExperience} سال`} />
              )}
              {profile.phone && (
                <InfoItem icon={<Phone size={14} />} label="تلفن" value={profile.phone} />
              )}
              {profile.website && (
                <InfoItem icon={<Globe size={14} />} label="وب‌سایت" value={profile.website} />
              )}
              {profile.address && (
                <InfoItem icon={<MapPin size={14} />} label="آدرس" value={profile.address} />
              )}
              {/* ✅ خط ایمیل حذف شد چون User فیلد email ندارد */}
            </div>
            {!profile.bio && !profile.specialization && (
              <p className="text-sm text-zinc-400 text-center py-4">
                اطلاعات پایه خود را تکمیل کنید
              </p>
            )}
          </div>
        )}
      </div>

      {/* تحصیلات */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-zinc-900 flex items-center gap-2">
            <GraduationCap size={18} />
            تحصیلات
          </h2>
          {editingSection !== 'education' ? (
            <button
              onClick={() => startEdit('education')}
              className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-lg px-3 py-1.5"
            >
              <Edit3 size={14} />
              ویرایش
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="flex items-center gap-1 text-xs bg-zinc-900 text-white rounded-lg px-3 py-1.5"
              >
                <Save size={14} />
                ذخیره
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1 text-xs border border-zinc-200 rounded-lg px-3 py-1.5"
              >
                <X size={14} />
                انصراف
              </button>
            </div>
          )}
        </div>

        {editingSection === 'education' ? (
          <div className="space-y-4">
            {(tempData.education || profile.education).map((edu) => (
              <div key={edu.id} className="border border-zinc-200 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>مدرک</label>
                    <input
                      className={inputClass}
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      placeholder="کارشناسی، کارشناسی ارشد..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>رشته</label>
                    <input
                      className={inputClass}
                      value={edu.field}
                      onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                      placeholder="حقوق"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>دانشگاه</label>
                    <input
                      className={inputClass}
                      value={edu.university}
                      onChange={(e) => updateEducation(edu.id, 'university', e.target.value)}
                      placeholder="نام دانشگاه"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>سال فارغ‌التحصیلی</label>
                    <input
                      className={inputClass}
                      value={edu.year}
                      onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                      placeholder="۱۴۰۰"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="flex items-center gap-1 text-xs text-red-500"
                >
                  <Trash2 size={13} />
                  حذف
                </button>
              </div>
            ))}
            <button
              onClick={addEducation}
              className="flex items-center gap-2 text-sm text-zinc-700 border border-dashed border-zinc-300 rounded-xl px-4 py-3 w-full justify-center hover:bg-zinc-50"
            >
              <Plus size={16} />
              افزودن تحصیلات
            </button>
          </div>
        ) : profile.education.length > 0 ? (
          <div className="space-y-3">
            {profile.education.map((edu) => (
              <div key={edu.id} className="flex items-start gap-3 p-4 bg-zinc-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">
                    {edu.degree} {edu.field && `- ${edu.field}`}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{edu.university}</p>
                  {edu.year && <p className="text-xs text-zinc-400 mt-0.5">{edu.year}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="تحصیلات خود را اضافه کنید" />
        )}
      </div>

      {/* سابقه کاری */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-zinc-900 flex items-center gap-2">
            <Briefcase size={18} />
            سابقه کاری
          </h2>
          {editingSection !== 'experience' ? (
            <button
              onClick={() => startEdit('experience')}
              className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-lg px-3 py-1.5"
            >
              <Edit3 size={14} />
              ویرایش
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="flex items-center gap-1 text-xs bg-zinc-900 text-white rounded-lg px-3 py-1.5"
              >
                <Save size={14} />
                ذخیره
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1 text-xs border border-zinc-200 rounded-lg px-3 py-1.5"
              >
                <X size={14} />
                انصراف
              </button>
            </div>
          )}
        </div>

        {editingSection === 'experience' ? (
          <div className="space-y-4">
            {(tempData.experience || profile.experience).map((exp) => (
              <div key={exp.id} className="border border-zinc-200 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>عنوان شغلی</label>
                    <input
                      className={inputClass}
                      value={exp.title}
                      onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                      placeholder="وکیل ارشد"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>شرکت / دفتر</label>
                    <input
                      className={inputClass}
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      placeholder="نام دفتر"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>از سال</label>
                    <input
                      className={inputClass}
                      value={exp.startYear}
                      onChange={(e) => updateExperience(exp.id, 'startYear', e.target.value)}
                      placeholder="۱۳۹۵"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>تا سال</label>
                    <input
                      className={inputClass}
                      value={exp.endYear}
                      onChange={(e) => updateExperience(exp.id, 'endYear', e.target.value)}
                      placeholder="اکنون"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>توضیحات</label>
                    <textarea
                      className={inputClass}
                      rows={2}
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      placeholder="شرح وظایف..."
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="flex items-center gap-1 text-xs text-red-500"
                >
                  <Trash2 size={13} />
                  حذف
                </button>
              </div>
            ))}
            <button
              onClick={addExperience}
              className="flex items-center gap-2 text-sm text-zinc-700 border border-dashed border-zinc-300 rounded-xl px-4 py-3 w-full justify-center hover:bg-zinc-50"
            >
              <Plus size={16} />
              افزودن سابقه کاری
            </button>
          </div>
        ) : profile.experience.length > 0 ? (
          <div className="relative pr-4 border-r-2 border-zinc-200 space-y-6">
            {profile.experience.map((exp) => (
              <div key={exp.id} className="relative">
                <div className="absolute -right-[1.3rem] top-0 w-4 h-4 bg-zinc-900 rounded-full border-2 border-white" />
                <p className="font-semibold text-sm text-zinc-900">{exp.title}</p>
                <p className="text-xs text-zinc-500">{exp.company}</p>
                <p className="text-xs text-zinc-400">
                  {exp.startYear} {exp.endYear && `— ${exp.endYear}`}
                </p>
                {exp.description && (
                  <p className="text-xs text-zinc-600 mt-1 leading-6">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="سابقه کاری خود را اضافه کنید" />
        )}
      </div>

      {/* مهارت‌ها */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-zinc-900 flex items-center gap-2">
            <Star size={18} />
            مهارت‌ها
          </h2>
          {editingSection !== 'skills' ? (
            <button
              onClick={() => startEdit('skills')}
              className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-lg px-3 py-1.5"
            >
              <Edit3 size={14} />
              ویرایش
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="flex items-center gap-1 text-xs bg-zinc-900 text-white rounded-lg px-3 py-1.5"
              >
                <Save size={14} />
                ذخیره
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1 text-xs border border-zinc-200 rounded-lg px-3 py-1.5"
              >
                <X size={14} />
                انصراف
              </button>
            </div>
          )}
        </div>

        {editingSection === 'skills' ? (
          <div className="space-y-3">
            {(tempData.skills || profile.skills).map((skill) => (
              <div key={skill.id} className="flex items-center gap-3">
                <input
                  className={`${inputClass} flex-1`}
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                  placeholder="حقوق کیفری"
                />
                <select
                  className="px-3 py-2 border border-zinc-300 rounded-lg text-sm"
                  value={skill.level}
                  onChange={(e) => updateSkill(skill.id, 'level', Number(e.target.value))}
                >
                  <option value={1}>مبتدی</option>
                  <option value={2}>متوسط</option>
                  <option value={3}>خوب</option>
                  <option value={4}>پیشرفته</option>
                  <option value={5}>متخصص</option>
                </select>
                <button onClick={() => removeSkill(skill.id)}>
                  <Trash2 size={15} className="text-red-400" />
                </button>
              </div>
            ))}
            <button
              onClick={addSkill}
              className="flex items-center gap-2 text-sm text-zinc-700 border border-dashed border-zinc-300 rounded-xl px-4 py-3 w-full justify-center hover:bg-zinc-50"
            >
              <Plus size={16} />
              افزودن مهارت
            </button>
          </div>
        ) : profile.skills.length > 0 ? (
          <div className="space-y-3">
            {profile.skills.map((skill) => (
              <div key={skill.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-700 font-medium">{skill.name}</span>
                  <span className="text-zinc-400">
                    {['', 'مبتدی', 'متوسط', 'خوب', 'پیشرفته', 'متخصص'][skill.level]}
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5">
                  <div
                    className="bg-zinc-900 h-1.5 rounded-full transition-all"
                    style={{ width: `${(skill.level / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="مهارت‌های خود را اضافه کنید" />
        )}
      </div>

      {/* زبان‌ها */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <h2 className="font-bold text-zinc-900 flex items-center gap-2 mb-4">
          <Globe size={18} />
          زبان‌ها
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.languages.map((lang) => (
            <span
              key={lang}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-sm"
            >
              {lang}
              <button onClick={() => removeLanguage(lang)}>
                <X size={12} className="text-zinc-400" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className={`${inputClass} flex-1`}
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
            placeholder="مثلاً: فارسی، انگلیسی، عربی"
          />
          <button
            onClick={addLanguage}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-zinc-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-zinc-800">{value}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-sm text-zinc-400 text-center py-6 border border-dashed border-zinc-200 rounded-xl">
      {text}
    </p>
  )
}
