// // components/notifications/AddReminderForm.tsx
// "use client";

// import { useState } from "react";
// import { User, Users, Calendar, Plus, X } from "lucide-react";
// import { useNotificationStore } from "@/store/notification.store";
// import type {
//   NotificationTarget,
//   NotificationPriority,
//   CreateReminderPayload,
// } from "@/types/notification";

// const mockClients = [
//   { id: "c1", name: "علی رضایی" },
//   { id: "c2", name: "مریم احمدی" },
// ];

// const mockCases = [
//   { id: "case1", name: "پرونده ملکی ۱۴۰۳" },
//   { id: "case2", name: "پرونده طلاق احمدی" },
// ];

// interface AddReminderFormProps {
//   onClose: () => void;
// }

// interface DateTimeInput {
//   id: string;
//   jalaliYear: string;
//   jalaliMonth: string;
//   jalaliDay: string;
//   hour: string;
//   minute: string;
// }

// // تبدیل تاریخ شمسی به میلادی
// function jalaliToGregorian(j_y: number, j_m: number, j_d: number): [number, number, number] {
//   let gy = j_y <= 979 ? 621 : 1600;
//   j_y -= j_y <= 979 ? 0 : 979;
  
//   let days = 365 * j_y + Math.floor(j_y / 33) * 8 + Math.floor(((j_y % 33) + 3) / 4) + 78 + j_d;
  
//   if (j_m < 7) days += (j_m - 1) * 31;
//   else days += (j_m - 7) * 30 + 186;
  
//   gy += 400 * Math.floor(days / 146097);
//   days %= 146097;
  
//   let leap = true;
//   if (days >= 36525) {
//     days--;
//     gy += 100 * Math.floor(days / 36524);
//     days %= 36524;
//     if (days >= 365) days++;
//     else leap = false;
//   }
  
//   gy += 4 * Math.floor(days / 1461);
//   days %= 1461;
  
//   if (days >= 366) {
//     leap = false;
//     days--;
//     gy += Math.floor(days / 365);
//     days = days % 365;
//   }
  
//   const g_d_n = [0, 31, leap ? 60 : 59, leap ? 91 : 90, leap ? 121 : 120, leap ? 152 : 151,
//                  leap ? 182 : 181, leap ? 213 : 212, leap ? 244 : 243, leap ? 274 : 273,
//                  leap ? 305 : 304, leap ? 335 : 334, leap ? 366 : 365];
  
//   let gm = 0;
//   for (let i = 0; i < 13; i++) {
//     if (days < g_d_n[i]) {
//       gm = i;
//       break;
//     }
//   }
  
//   const gd = days - g_d_n[gm - 1] + 1;
  
//   return [gy, gm, gd];
// }

// export function AddReminderForm({ onClose }: AddReminderFormProps) {
//   const [title, setTitle] = useState("");
//   const [message, setMessage] = useState("");
//   const [target, setTarget] = useState<NotificationTarget | "both">("lawyer");
//   const [priority, setPriority] = useState<NotificationPriority>("medium");
//   const [clientId, setClientId] = useState("");
//   const [caseId, setCaseId] = useState("");
  
//   const [dateTimes, setDateTimes] = useState<DateTimeInput[]>([
//     {
//       id: "1",
//       jalaliYear: "",
//       jalaliMonth: "",
//       jalaliDay: "",
//       hour: "",
//       minute: "",
//     },
//   ]);

//   const { addReminder } = useNotificationStore();

//   const addDateTime = () => {
//     setDateTimes([
//       ...dateTimes,
//       {
//         id: Date.now().toString(),
//         jalaliYear: "",
//         jalaliMonth: "",
//         jalaliDay: "",
//         hour: "",
//         minute: "",
//       },
//     ]);
//   };

//   const removeDateTime = (id: string) => {
//     if (dateTimes.length > 1) {
//       setDateTimes(dateTimes.filter((dt) => dt.id !== id));
//     }
//   };

//   const updateDateTime = (id: string, field: keyof DateTimeInput, value: string) => {
//     setDateTimes(
//       dateTimes.map((dt) => (dt.id === id ? { ...dt, [field]: value } : dt))
//     );
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!title.trim()) {
//       alert("لطفاً عنوان را وارد کنید");
//       return;
//     }

//     const selectedClient = mockClients.find((c) => c.id === clientId);
//     const selectedCase = mockCases.find((c) => c.id === caseId);

//     // تبدیل تاریخ‌های شمسی به میلادی
//     const scheduledDates: string[] = [];
    
//     dateTimes.forEach((dt) => {
//       if (dt.jalaliYear && dt.jalaliMonth && dt.jalaliDay) {
//         const [gy, gm, gd] = jalaliToGregorian(
//           parseInt(dt.jalaliYear),
//           parseInt(dt.jalaliMonth),
//           parseInt(dt.jalaliDay)
//         );
        
//         const h = dt.hour ? parseInt(dt.hour) : 0;
//         const m = dt.minute ? parseInt(dt.minute) : 0;
        
//         const date = new Date(gy, gm - 1, gd, h, m);
//         scheduledDates.push(date.toISOString());
//       }
//     });

//     // اگر target برای هر دو باشد، دو یادآوری جداگانه ایجاد می‌کنیم
//     if (target === "both") {
//       // یادآوری برای وکیل
//       scheduledDates.forEach((scheduledFor) => {
//         const payload: CreateReminderPayload = {
//           title,
//           message: message || undefined,
//           priority,
//           target: "lawyer",
//           scheduledFor,
//           clientId: clientId || undefined,
//           clientName: selectedClient?.name,
//           caseId: caseId || undefined,
//           caseName: selectedCase?.name,
//         };
//         addReminder(payload);
//       });

//       // یادآوری برای موکل
//       if (clientId) {
//         scheduledDates.forEach((scheduledFor) => {
//           const payload: CreateReminderPayload = {
//             title,
//             message: message || undefined,
//             priority,
//             target: "client",
//             scheduledFor,
//             clientId,
//             clientName: selectedClient?.name,
//             caseId: caseId || undefined,
//             caseName: selectedCase?.name,
//           };
//           addReminder(payload);
//         });
//       }
//     } else {
//       // یادآوری معمولی
//       if (scheduledDates.length > 0) {
//         scheduledDates.forEach((scheduledFor) => {
//           const payload: CreateReminderPayload = {
//             title,
//             message: message || undefined,
//             priority,
//             target: target as NotificationTarget,
//             scheduledFor,
//             clientId: clientId || undefined,
//             clientName: selectedClient?.name,
//             caseId: caseId || undefined,
//             caseName: selectedCase?.name,
//           };
//           addReminder(payload);
//         });
//       } else {
//         const payload: CreateReminderPayload = {
//           title,
//           message: message || undefined,
//           priority,
//           target: target as NotificationTarget,
//           clientId: clientId || undefined,
//           clientName: selectedClient?.name,
//           caseId: caseId || undefined,
//           caseName: selectedCase?.name,
//         };
//         addReminder(payload);
//       }
//     }

//     setTitle("");
//     setMessage("");
//     setTarget("lawyer");
//     setPriority("medium");
//     setClientId("");
//     setCaseId("");
//     setDateTimes([
//       {
//         id: "1",
//         jalaliYear: "",
//         jalaliMonth: "",
//         jalaliDay: "",
//         hour: "",
//         minute: "",
//       },
//     ]);
//     onClose();
//   };

//   const inputCls =
//     "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400";
//   const labelCls = "block text-sm font-medium text-gray-700 mb-2";

//   const persianMonths = [
//     "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
//     "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
//   ];

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div>
//         <label className={labelCls}>یادآوری برای</label>
//         <div className="grid grid-cols-3 gap-2">
//           <button
//             type="button"
//             onClick={() => setTarget("lawyer")}
//             className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
//               target === "lawyer"
//                 ? "border-blue-600 bg-blue-50 text-blue-700"
//                 : "border-gray-200 text-gray-600 hover:border-gray-300"
//             }`}
//           >
//             <User size={16} />
//             <span className="text-sm font-medium">وکیل</span>
//           </button>

//           <button
//             type="button"
//             onClick={() => setTarget("client")}
//             className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
//               target === "client"
//                 ? "border-green-600 bg-green-50 text-green-700"
//                 : "border-gray-200 text-gray-600 hover:border-gray-300"
//             }`}
//           >
//             <Users size={16} />
//             <span className="text-sm font-medium">موکل</span>
//           </button>

//           <button
//             type="button"
//             onClick={() => setTarget("both")}
//             className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
//               target === "both"
//                 ? "border-purple-600 bg-purple-50 text-purple-700"
//                 : "border-gray-200 text-gray-600 hover:border-gray-300"
//             }`}
//           >
//             <Users size={16} />
//             <span className="text-sm font-medium">هر دو</span>
//           </button>
//         </div>
//       </div>

//       {(target === "client" || target === "both") && (
//         <div>
//           <label className={labelCls}>انتخاب موکل</label>
//           <select
//             className={inputCls}
//             value={clientId}
//             onChange={(e) => setClientId(e.target.value)}
//             required={target === "client" || target === "both"}
//           >
//             <option value="">انتخاب موکل...</option>
//             {mockClients.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       <div>
//         <label className={labelCls}>پرونده مرتبط (اختیاری)</label>
//         <select
//           className={inputCls}
//           value={caseId}
//           onChange={(e) => setCaseId(e.target.value)}
//         >
//           <option value="">بدون پرونده</option>
//           {mockCases.map((c) => (
//             <option key={c.id} value={c.id}>
//               {c.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label className={labelCls}>اولویت</label>
//         <div className="flex gap-2">
//           {[
//             { value: "low", label: "کم", color: "bg-green-100 text-green-700" },
//             { value: "medium", label: "متوسط", color: "bg-amber-100 text-amber-700" },
//             { value: "high", label: "فوری", color: "bg-red-100 text-red-700" },
//           ].map((item) => (
//             <button
//               key={item.value}
//               type="button"
//               onClick={() => setPriority(item.value as NotificationPriority)}
//               className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
//                 priority === item.value
//                   ? `${item.color} border-current`
//                   : "border-gray-200 text-gray-600 hover:border-gray-300"
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div>
//         <label className={labelCls}>عنوان *</label>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className={inputCls}
//           placeholder="عنوان یادآوری را وارد کنید"
//           required
//         />
//       </div>

//       <div>
//         <label className={labelCls}>توضیحات (اختیاری)</label>
//         <textarea
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           rows={3}
//           className={`${inputCls} resize-none`}
//           placeholder="توضیحات بیشتر..."
//         />
//       </div>

//       <div>
//         <div className="flex items-center justify-between mb-2">
//           <label className={labelCls}>
//             <Calendar size={16} className="inline ml-1" />
//             تاریخ و زمان یادآوری (اختیاری)
//           </label>
//           <button
//             type="button"
//             onClick={addDateTime}
//             className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
//           >
//             <Plus size={16} />
//             <span>افزودن تاریخ</span>
//           </button>
//         </div>

//         <div className="space-y-3">
//           {dateTimes.map((dt, index) => (
//             <div key={dt.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-xs text-gray-600">تاریخ {index + 1}</span>
//                 {dateTimes.length > 1 && (
//                   <button
//                     type="button"
//                     onClick={() => removeDateTime(dt.id)}
//                     className="text-red-500 hover:text-red-700"
//                   >
//                     <X size={16} />
//                   </button>
//                 )}
//               </div>

//               <div className="grid grid-cols-3 gap-2 mb-2">
//                 <input
//                   type="number"
//                   value={dt.jalaliYear}
//                   onChange={(e) => updateDateTime(dt.id, "jalaliYear", e.target.value)}
//                   className={inputCls}
//                   placeholder="سال (۱۴۰۴)"
//                   min="1300"
//                   max="1500"
//                 />
//                 <select
//                   value={dt.jalaliMonth}
//                   onChange={(e) => updateDateTime(dt.id, "jalaliMonth", e.target.value)}
//                   className={inputCls}
//                 >
//                   <option value="">ماه</option>
//                   {persianMonths.map((month, idx) => (
//                     <option key={idx} value={idx + 1}>
//                       {month}
//                     </option>
//                   ))}
//                 </select>
//                 <input
//                   type="number"
//                   value={dt.jalaliDay}
//                   onChange={(e) => updateDateTime(dt.id, "jalaliDay", e.target.value)}
//                   className={inputCls}
//                   placeholder="روز"
//                   min="1"
//                   max="31"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-2">
//                 <input
//                   type="number"
//                   value={dt.hour}
//                   onChange={(e) => updateDateTime(dt.id, "hour", e.target.value)}
//                   className={inputCls}
//                   placeholder="ساعت (۰-۲۳)"
//                   min="0"
//                   max="23"
//                 />
//                 <input
//                   type="number"
//                   value={dt.minute}
//                   onChange={(e) => updateDateTime(dt.id, "minute", e.target.value)}
//                   className={inputCls}
//                   placeholder="دقیقه (۰-۵۹)"
//                   min="0"
//                   max="59"
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="flex gap-3 pt-2">
//         <button
//           type="submit"
//           className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
//         >
//           افزودن یادآوری
//         </button>
//         <button
//           type="button"
//           onClick={onClose}
//           className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//         >
//           انصراف
//         </button>
//       </div>
//     </form>
//   );
// }
// components/notifications/AddReminderForm.tsx




"use client";

import { useState } from "react";
import { User, Users, Calendar, Plus, X } from "lucide-react";
import { useNotificationStore } from "@/store/notification.store";
import { useCasesStore } from "@/store/cases.store";
import { useMemo } from "react"
import { useClientStore } from "@/store/client.store"

import type {
  NotificationTarget,
  NotificationPriority,
  CreateReminderPayload,
} from "@/types/notification";

interface AddReminderFormProps {
  onClose: () => void;
}

interface DateTimeInput {
  id: string;
  jalaliYear: string;
  jalaliMonth: string;
  jalaliDay: string;
  hour: string;
  minute: string;
}

function jalaliToGregorian(j_y: number, j_m: number, j_d: number): [number, number, number] {
  let gy = j_y <= 979 ? 621 : 1600;
  j_y -= j_y <= 979 ? 0 : 979;
  
  let days = 365 * j_y + Math.floor(j_y / 33) * 8 + Math.floor(((j_y % 33) + 3) / 4) + 78 + j_d;
  
  if (j_m < 7) days += (j_m - 1) * 31;
  else days += (j_m - 7) * 30 + 186;
  
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  
  let leap = true;
  if (days >= 36525) {
    days--;
    gy += 100 * Math.floor(days / 36524);
    days %= 36524;
    if (days >= 365) days++;
    else leap = false;
  }
  
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  
  if (days >= 366) {
    leap = false;
    days--;
    gy += Math.floor(days / 365);
    days = days % 365;
  }
  
  const g_d_n = [0, 31, leap ? 60 : 59, leap ? 91 : 90, leap ? 121 : 120, leap ? 152 : 151,
                 leap ? 182 : 181, leap ? 213 : 212, leap ? 244 : 243, leap ? 274 : 273,
                 leap ? 305 : 304, leap ? 335 : 334, leap ? 366 : 365];
  
  let gm = 0;
  for (let i = 0; i < 13; i++) {
    if (days < g_d_n[i]) {
      gm = i;
      break;
    }
  }
  
  const gd = days - g_d_n[gm - 1] + 1;
  
  return [gy, gm, gd];
}

export function AddReminderForm({ onClose }: AddReminderFormProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<NotificationTarget | "both">("lawyer");
  const [priority, setPriority] = useState<NotificationPriority>("medium");
  const [clientId, setClientId] = useState("");
  const [caseId, setCaseId] = useState("");
  const addReminder = useNotificationStore((state) => state.addReminder);
  const [dateTimes, setDateTimes] = useState<DateTimeInput[]>([
    {
      id: "1",
      jalaliYear: "",
      jalaliMonth: "",
      jalaliDay: "",
      hour: "",
      minute: "",
    },
  ]);

const cases = useCasesStore((s) => s.cases)
const storeClients = useClientStore((s) => s.clients)

const clients = useMemo(() => {
  const map = new Map()

storeClients.forEach((c) => {
  const fullName = `${c.firstName} ${c.lastName}`.trim()

  map.set(c.id, {
    id: c.id,
    name: fullName,
    phone: c.phoneNumber,
  })
})


  // موکلین از پرونده‌ها
  cases.forEach((c) => {
    if (c.clientName) {
      const key = c.clientPhone || c.clientName

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: c.clientName,
          phone: c.clientPhone,
        })
      }
    }
  })

  return Array.from(map.values())
}, [cases, storeClients])


  const addDateTime = () => {
    setDateTimes([
      ...dateTimes,
      {
        id: Date.now().toString(),
        jalaliYear: "",
        jalaliMonth: "",
        jalaliDay: "",
        hour: "",
        minute: "",
      },
    ]);
  };

  const removeDateTime = (id: string) => {
    if (dateTimes.length > 1) {
      setDateTimes(dateTimes.filter((dt) => dt.id !== id));
    }
  };

  const updateDateTime = (id: string, field: keyof DateTimeInput, value: string) => {
    setDateTimes(
      dateTimes.map((dt) => (dt.id === id ? { ...dt, [field]: value } : dt))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("لطفاً عنوان را وارد کنید");
      return;
    }

    const selectedClient = clients.find((c) => c.id === clientId);
    const selectedCase = cases.find((c) => c.id === caseId);

    const scheduledDates: string[] = [];
    
    dateTimes.forEach((dt) => {
      if (dt.jalaliYear && dt.jalaliMonth && dt.jalaliDay) {
        const [gy, gm, gd] = jalaliToGregorian(
          parseInt(dt.jalaliYear),
          parseInt(dt.jalaliMonth),
          parseInt(dt.jalaliDay)
        );
        
        const h = dt.hour ? parseInt(dt.hour) : 0;
        const m = dt.minute ? parseInt(dt.minute) : 0;
        
        const date = new Date(gy, gm - 1, gd, h, m);
        scheduledDates.push(date.toISOString());
      }
    });
   if (target === "both") {
  scheduledDates.forEach((scheduledFor) => {
    const payload: CreateReminderPayload = {
      title,
      ...(message && { message }),
      priority,
      target: "lawyer",
      scheduledFor,
      ...(clientId && { clientId }),
      ...(selectedClient?.name && { clientName: selectedClient.name }),
      ...(caseId && { caseId }),
      ...(selectedCase?.title && { caseName: selectedCase.title }),
    };
    addReminder(payload);
  });

  if (clientId) {
    scheduledDates.forEach((scheduledFor) => {
      const payload: CreateReminderPayload = {
        title,
        ...(message && { message }),
        priority,
        target: "client",
        scheduledFor,
        clientId,
        ...(selectedClient?.name && { clientName: selectedClient.name }),
        ...(caseId && { caseId }),
        ...(selectedCase?.title && { caseName: selectedCase.title }),
      };
      addReminder(payload);
    });
  }
} else {
  if (scheduledDates.length > 0) {
    scheduledDates.forEach((scheduledFor) => {
      const payload: CreateReminderPayload = {
        title,
        ...(message && { message }),
        priority,
        target: target as NotificationTarget,
        scheduledFor,
        ...(clientId && { clientId }),
        ...(selectedClient?.name && { clientName: selectedClient.name }),
        ...(caseId && { caseId }),
        ...(selectedCase?.title && { caseName: selectedCase.title }),
      };
      addReminder(payload);
    });
  } else {
    const payload: CreateReminderPayload = {
      title,
      ...(message && { message }),
      priority,
      target: target as NotificationTarget,
      ...(clientId && { clientId }),
      ...(selectedClient?.name && { clientName: selectedClient.name }),
      ...(caseId && { caseId }),
      ...(selectedCase?.title && { caseName: selectedCase.title }),
    };
    addReminder(payload);
  }
}


    setTitle("");
    setMessage("");
    setTarget("lawyer");
    setPriority("medium");
    setClientId("");
    setCaseId("");
    setDateTimes([
      {
        id: "1",
        jalaliYear: "",
        jalaliMonth: "",
        jalaliDay: "",
        hour: "",
        minute: "",
      },
    ]);
    onClose();
  };

  const inputCls =
    "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400";
  const labelCls = "block text-sm font-medium text-gray-700 mb-2";

  const persianMonths = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
  ];
console.log("storeClients:", storeClients)
console.log("cases:", cases)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>یادآوری برای</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setTarget("lawyer")}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
              target === "lawyer"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <User size={16} />
            <span className="text-sm font-medium">وکیل</span>
          </button>

          <button
            type="button"
            onClick={() => setTarget("client")}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
              target === "client"
                ? "border-green-600 bg-green-50 text-green-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <Users size={16} />
            <span className="text-sm font-medium">موکل</span>
          </button>

          <button
            type="button"
            onClick={() => setTarget("both")}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
              target === "both"
                ? "border-purple-600 bg-purple-50 text-purple-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <Users size={16} />
            <span className="text-sm font-medium">هر دو</span>
          </button>
        </div>
      </div>

      {(target === "client" || target === "both") && (
        <div>
          <label className={labelCls}>انتخاب موکل</label>
          <select
            className={inputCls}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required={target === "client" || target === "both"}
          >
            <option value="">انتخاب موکل...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={labelCls}>پرونده مرتبط (اختیاری)</label>
        <select
          className={inputCls}
          value={caseId}
          onChange={(e) => setCaseId(e.target.value)}
        >
          <option value="">بدون پرونده</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>اولویت</label>
        <div className="flex gap-2">
          {[
            { value: "low", label: "کم", color: "bg-green-100 text-green-700 border-green-300" },
            { value: "medium", label: "متوسط", color: "bg-amber-100 text-amber-700 border-amber-300" },
            { value: "high", label: "فوری", color: "bg-red-100 text-red-700 border-red-300" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPriority(item.value as NotificationPriority)}
              className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                priority === item.value
                  ? `${item.color}`
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>عنوان *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
          placeholder="عنوان یادآوری را وارد کنید"
          required
        />
      </div>

      <div>
        <label className={labelCls}>توضیحات (اختیاری)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="توضیحات بیشتر..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls}>
            <Calendar size={16} className="inline ml-1" />
            تاریخ و زمان یادآوری (اختیاری)
          </label>
          <button
            type="button"
            onClick={addDateTime}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            <span>افزودن تاریخ</span>
          </button>
        </div>

        <div className="space-y-3">
          {dateTimes.map((dt, index) => (
            <div key={dt.id} className="p-4 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">تاریخ {index + 1}</span>
                {dateTimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDateTime(dt.id)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-600">
                    <label className="text-xs text-gray-600 mb-1 block">سال</label>
                    <input
                      type="number"
                      value={dt.jalaliYear}
                      onChange={(e) => updateDateTime(dt.id, "jalaliYear", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="۱۴۰۴"
                      min="1300"
                      max="1500"
                    />
                  </div>
                  <div className="text-gray-600">
                    <label className="text-xs text-gray-600 mb-1 block">ماه</label>
                    <select
                      value={dt.jalaliMonth}
                      onChange={(e) => updateDateTime(dt.id, "jalaliMonth", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">انتخاب</option>
                      {persianMonths.map((month, idx) => (
                        <option key={idx} value={idx + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-gray-600">
                    <label className="text-xs text-gray-600 mb-1 block">روز</label>
                    <input
                      type="number"
                      value={dt.jalaliDay}
                      onChange={(e) => updateDateTime(dt.id, "jalaliDay", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="۱"
                      min="1"
                      max="31"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">
                    <label className="text-xs text-gray-600 mb-1 block">ساعت</label>
                    <input
                      type="number"
                      value={dt.hour}
                      onChange={(e) => updateDateTime(dt.id, "hour", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="۰-۲۳"
                      min="0"
                      max="23"
                    />
                  </div>
                  <div className="text-gray-600">
                    <label className="text-xs text-gray-600 mb-1 block">دقیقه</label>
                    <input
                      type="number"
                      value={dt.minute}
                      onChange={(e) => updateDateTime(dt.id, "minute", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="۰-۵۹"
                      min="0"
                      max="59"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          افزودن یادآوری
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}