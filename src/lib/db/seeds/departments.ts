import type { Department } from "../types";

/**
 * Department seeds — six academic departments of the fictional Padma Model
 * College. headTeacherId values reference teacher ids in ./teachers.ts
 * (tch-01 ... tch-15); slugs are referenced by teachers.departmentSlug.
 */

export const seedDepartments: Department[] = [
  {
    id: "dep-ict",
    slug: "computer-science-and-ict",
    name: "Computer Science and ICT",
    summary:
      "Programming, networking and ICT literacy across SSC and HSC, with two modern computer labs.",
    descriptionMd: `The Computer Science and ICT department runs the college's largest practical programme. Students work in two dedicated computer laboratories with forty-two networked workstations, licensed productivity and programming software, and high-speed internet access filtered for study use.

SSC students follow the national ICT curriculum with weekly hands-on lab periods, while HSC science students take Information and Communication Technology as a compulsory subject and may join the programming club, which trains teams for the national informatics olympiad. The department also maintains the college portal and supports teachers of other departments with digital classroom tools.`,
    establishedYear: 2005,
    headTeacherId: "tch-01",
  },
  {
    id: "dep-physics",
    slug: "physics",
    name: "Physics",
    summary:
      "Mechanics to modern physics with three fully equipped laboratories and a strong practical-exam record.",
    descriptionMd: `The Physics department has taught every science batch of the college since its founding. Three laboratories seat forty-eight students per practical session and hold calibrated instruments for mechanics, heat, optics, electricity and electronics experiments prescribed by the national curriculum.

The department places particular emphasis on practical examination preparation: HSC candidates complete a full cycle of board-standard experiments before the Test Examination, and demonstration classes use data-logging sensors so students can analyse real measurements rather than textbook numbers. A weekly problem-solving clinic is open to all classes.`,
    establishedYear: 1998,
    headTeacherId: "tch-04",
  },
  {
    id: "dep-chemistry",
    slug: "chemistry",
    name: "Chemistry",
    summary:
      "Physical, inorganic and organic chemistry with a ventilated wet-lab and a quantitative analysis suite.",
    descriptionMd: `The Chemistry department operates a fume-ventilated wet laboratory for qualitative and quantitative analysis, plus a separate balance room with analytical balances for gravimetric work. Practical classes run in groups of twenty-four so that every student handles apparatus personally.

Beyond the board practicals, the department organises the chemistry segment of the annual science fair and maintains a safety-first lab culture: students complete a safety induction before their first session and wear protective equipment supplied by the college. HSC students receive structured viva practice ahead of the board practical examination.`,
    establishedYear: 1998,
    headTeacherId: "tch-07",
  },
  {
    id: "dep-mathematics",
    slug: "mathematics",
    name: "Mathematics",
    summary:
      "General and higher mathematics with a problem-clinic culture and consistent board-exam results.",
    descriptionMd: `The Mathematics department teaches general mathematics to all SSC and HSC classes and higher mathematics to science students. Its teaching approach is built on weekly problem clinics, where students solve past board questions on the board and discuss alternative methods with teachers.

The department coaches the college team for the inter-college mathematics olympiad and keeps an open library shelf of reference texts that students may borrow between classes. Model-test results are analysed question by question so that revision classes target the topics each batch actually finds difficult.`,
    establishedYear: 2001,
    headTeacherId: "tch-09",
  },
  {
    id: "dep-biology",
    slug: "biology",
    name: "Biology",
    summary:
      "Botany, zoology and human biology with a specimen museum and a compound-microscope laboratory.",
    descriptionMd: `The Biology department maintains a museum of preserved botanical and zoological specimens built up over two decades, and a laboratory with thirty compound microscopes plus dissecting sets for SSC practical classes.

Field study is part of the curriculum: students complete a guided campus botanical survey in first year and visit a natural-history collection in second year. The department also runs the health and wellbeing club, which arranges blood-grouping camps and first-aid awareness sessions for the college community.`,
    establishedYear: 2004,
    headTeacherId: "tch-12",
  },
  {
    id: "dep-business-studies",
    slug: "business-studies",
    name: "Business Studies",
    summary:
      "Accounting, finance, marketing and entrepreneurship for the HSC business studies programme.",
    descriptionMd: `The Business Studies department offers the HSC business studies programme with courses in accounting, business organisation, finance, banking, marketing and entrepreneurship. Teachers use case studies drawn from Bangladeshi companies so that classroom concepts connect to the local economy.

The department runs a junior enterprise programme in which first-year students plan and operate a small campus stall during the annual cultural week, keeping real accounts that are later audited in class. Graduates regularly progress to BBA programmes at public and private universities.`,
    establishedYear: 2008,
    headTeacherId: "tch-14",
  },
];
