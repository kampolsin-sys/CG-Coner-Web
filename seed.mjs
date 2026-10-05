import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initialData = [
  {
    title: "การบริหารความเสี่ยง (Risk Management)",
    description: null,
    contents: [
      {
        text: "การบริหารความเสี่ยงประกอบด้วย 6 กระบวนการหลัก และที่สำคัญคือเป็นกระบวนการที่ทำเป็น Cycle ต่อเนื่องกันและสม่ำเสมอ",
        linkUrl: "https://www.live-platforms.com/th/education/video/209-how-to-manage-risk/"
      },
      {
        text: "3 Line of Defense เป็นหลักการที่นำมาใช้ในการระบุผู้ที่เกี่ยวข้องในการบริหารความเสี่ยง ซึ่งครอบคลุมและเกี่ยวข้องกับพนักงานทุกระดับในองค์กรตามบทบาทหน้าที่ อันเป็นปัจจัยสำคัญที่สนับสนุนการบริหารความเสี่ยงให้ประสบความสำเร็จ รวมทั้งการส่งเสริมให้เกิดกระบวนการบริหารความเสี่ยงจากผู้บริหาร หรือการกำหนด Evaluation Criteria เป็นแรงจูงใจให้พนักงานคำนึงถึงการบริหารความเสี่ยง",
        linkUrl: null
      }
    ]
  },
  {
    title: "การป้องกันการใช้ข้อมูลภายใน (Insider Trading)",
    description: null,
    contents: [
      {
        text: "กรรมการ ผู้บริหาร ต้องทำอย่างไรในช่วงที่มีข้อมูลภายใน",
        linkUrl: "https://youtu.be/tQkYx9gIq7Y"
      },
      {
        text: "กรรมการหรือผู้บริหารที่รายงานการเปลี่ยนแปลงการถือครองหลักทรัพย์ (แบบ 59) ตาม พ.ร.บ. หลักทรัพย์ฯ มาตรา 59 ล่าช้า หรือไม่ถูกต้อง เข้าข่ายมีความผิดต้องระวางโทษปรับไม่เกิน 500,000 บาท และปรับอีกไม่เกินวันละ 10,000 บาท ตลอดระยะเวลาที่ยังไม่ปฏิบัติให้ถูกต้อง",
        linkUrl: null
      }
    ]
  },
  {
    title: "การรายงานการถือหลักทรัพย์และสัญญาซื้อขายล่วงหน้า",
    description: null,
    contents: [
      {
        text: "การรายงานการถือหลักทรัพย์และสัญญาซื้อขายล่วงหน้าตามมาตรา 59 ถือเป็นหน้าที่สำคัญของผู้ที่มีหน้าที่รายงาน ตั้งแต่กรรมการ ผู้บริหาร ผู้มีอำนาจควบคุม รวมถึงผู้เกี่ยวข้องทั้งหมด เพื่อให้ผู้ลงทุน ผู้ถือหุ้น ทราบถึงความเคลื่อนไหวและความปลี่ยนแปลงการถือหุ้นหรือสัญญาซื้อขายล่วงหน้า",
        linkUrl: null
      }
    ]
  },
  {
    title: "ความขัดแย้งทางผลประโยชน์ (Conflict of Interest)",
    description: null,
    contents: [
      {
        text: "โครงสร้างธุรกิจที่อาจมีความขัดแย้งทางผลประโยชน์นั้น พิจารณาได้จากบุคคลที่อาจมีความขัดแย้งทางผลประโยชน์มีการทำธุรกิจแข่งขันกับบริษัท หรือเป็นธุรกิจต่อเนื่องที่อาจเอื้อประโยชน์ต่อบุคคลที่มีความขัดแย้ง ไม่เป็นไปเพื่อประโยชน์สูงสุดต่อบริษัท",
        linkUrl: null
      },
      {
        text: "การปรับโครงสร้างธุรกิจเพื่อขจัดความขัดแย้งทางผลประโยชน์ สามารถทำได้โดยการจัดโครงสร้างบริษัทที่ทำธุรกิจเหมือนกันหรือแข่งกันให้รวมกันหรืออยู่ในกลุ่มเดียวกัน หรืออาจพิจารณายกเลิกกิจการ หรือขายให้บุคคลภายนอก ส่วนการจัดโครงสร้างธุรกิจที่ต่อเนื่องกัน (Business Value Chain) นั้น ให้นำมาอยู่ในกลุ่มเดียวกัน หรืออาจพิจารณาปรับเงื่อนไขเพื่อให้เกิดประโยชน์ต่อบริษัทที่จะเข้าจดทะเบียนมากที่สุด",
        linkUrl: null
      }
    ]
  },
  {
    title: "ESG Risk",
    description: null,
    contents: [
      {
        text: "การอบรม ESG Risk หลักสูตร “Executive Training on Trends in ESG Disclosure and Implementation through Sustainable Operations” โดยวิทยากรจาก ERM",
        linkUrl: null
      },
      {
        text: "งานสัมมนา Online Director’s Briefing 4/2025 หัวข้อ \"ESG Risks Mitigation: สิ่งที่กรรมการต้องรู้ ก่อนที่ความเสี่ยงจะกลายเป็นจุดเปลี่ยนขององค์กร\"",
        linkUrl: null
      }
    ]
  }
];

async function main() {
  console.log("Seeding database...");
  await prisma.content.deleteMany();
  await prisma.topic.deleteMany();

  for (let i = 0; i < initialData.length; i++) {
    const item = initialData[i];
    const topic = await prisma.topic.create({
      data: {
        title: item.title,
        description: item.description,
        order: i
      }
    });

    for (let j = 0; j < item.contents.length; j++) {
      const content = item.contents[j];
      await prisma.content.create({
        data: {
          topicId: topic.id,
          text: content.text,
          linkUrl: content.linkUrl,
          order: j
        }
      });
    }
  }
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
