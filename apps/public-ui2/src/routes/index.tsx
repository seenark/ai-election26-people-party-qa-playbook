import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { createFileRoute } from '@tanstack/react-router'
import {
  Zap,
  Server,
  Route as RouteIcon,
  Shield,
  Waves,
  Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const features = [
    {
      icon: <Zap className="w-12 h-12 text-cyan-400" />,
      title: 'Powerful Server Functions',
      description:
        'Write server-side code that seamlessly integrates with your client components. Type-safe, secure, and simple.',
    },
    {
      icon: <Server className="w-12 h-12 text-cyan-400" />,
      title: 'Flexible Server Side Rendering',
      description:
        'Full-document SSR, streaming, and progressive enhancement out of the box. Control exactly what renders where.',
    },
    {
      icon: <RouteIcon className="w-12 h-12 text-cyan-400" />,
      title: 'API Routes',
      description:
        'Build type-safe API endpoints alongside your application. No separate backend needed.',
    },
    {
      icon: <Shield className="w-12 h-12 text-cyan-400" />,
      title: 'Strongly Typed Everything',
      description:
        'End-to-end type safety from server to client. Catch errors before they reach production.',
    },
    {
      icon: <Waves className="w-12 h-12 text-cyan-400" />,
      title: 'Full Streaming Support',
      description:
        'Stream data from server to client progressively. Perfect for AI applications and real-time updates.',
    },
    {
      icon: <Sparkles className="w-12 h-12 text-cyan-400" />,
      title: 'Next Generation Ready',
      description:
        'Built from the ground up for modern web applications. Deploy anywhere JavaScript runs.',
    },
  ]

  const content = `---
title: "แนวทางของพรรคประชาชนต่อสังคมสูงวัย แรงงาน และอุตสาหกรรมใหม่"
id: "019bae1b-6b30-7000-982b-83d79fe5939a"
topic: "Economy"
confidenceScore: 95
---

## คำถาม
**พรรคประชาชนมีแนวทางอย่างไรในการแก้ไขปัญหาโครงสร้างสังคมสูงวัย การขาดแคลนแรงงาน และการขาดอุตสาหกรรมใหม่?**

## คำตอบแบบสรุป
พรรคประชาชนจะสร้างงานใหม่ พัฒนาอุตสาหกรรมแห่งอนาคต และยกระดับคุณภาพชีวิตผู้สูงอายุ เพื่อรับมือกับสังคมสูงวัยและการเปลี่ยนแปลงทางเศรษฐกิจ

---

## คำตอบแบบละเอียด
พรรคประชาชนมุ่งมั่นที่จะแก้ไขปัญหาโครงสร้างสังคมสูงวัย การขาดแคลนแรงงาน และการขาดอุตสาหกรรมใหม่ โดยผลักดันนโยบายที่สร้างงานใหม่ พัฒนาอุตสาหกรรมแห่งอนาคต และดูแลผู้สูงอายุไปพร้อมกัน

สำหรับสังคมสูงวัย พรรคฯ จะเพิ่มเบี้ยผู้สูงอายุเป็น **1,500 บาทต่อเดือนภายในปี 2573**

ด้านการสร้างงานและอุตสาหกรรมใหม่ เน้นการเปลี่ยนผ่านสู่อุตสาหกรรมยานยนต์แห่งอนาคต เช่น ยานยนต์ไฟฟ้า รถไร้คนขับ และ Connected Car พร้อมพัฒนาทักษะแรงงานให้สอดคล้องกับเทคโนโลยีใหม่

---

## แนวทาง (How)

### การกระทำสำคัญ
- เพิ่มเบี้ยผู้สูงอายุเป็น **1,500 บาท/เดือน**
- ส่งเสริมเกษตรกรให้ทำเกษตรผสมผสานและส่งผลผลิตเข้าโครงการอาหารในโรงเรียน
- จัดตั้ง **บอร์ดยานยนต์อนาคต** แทนบอร์ด EV
- ดึงการลงทุนจากบริษัทรถยนต์โลก พร้อมเงื่อนไข Local Content
- สร้างขีดความสามารถผลิตแบตเตอรี่ในประเทศ

### ทรัพยากรที่ใช้
- สิทธิประโยชน์ด้านภาษี
- มาตรการส่งเสริมการลงทุนของ **BOI**

---

## ประเด็นสำคัญ (Key Points)
- เบี้ยผู้สูงอายุเพิ่มเป็น 1,500 บาทในปี 2573  
- ส่งเสริมอุตสาหกรรมยานยนต์แห่งอนาคต  
- Upskill/Reskill แรงงานด้านอิเล็กทรอนิกส์และซอฟต์แวร์

## ลิงก์นโยบายที่เกี่ยวข้อง
- [สวัสดิการ](https://election69.peoplesparty.or.th/policy/2/C-4)
- [ความหลากหลายทางชีวภาพ](https://election69.peoplesparty.or.th/policy/4/C-2-5-03)
- [อุตสาหกรรมยานยนต์แห่งอนาคต](https://election69.peoplesparty.or.th/policy/4/D-5-1-05)

`

  return (
    <div >
      <MarkdownRenderer content={content} />
    </div>
  )
}
