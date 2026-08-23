import { useState } from "react";
import { ChevronIcon } from "./ProfileIcons";

const QUESTIONS = [
  {
    q: "Bileti necə ala bilərəm?",
    a: "Tədbir səhifəsində sektor və yer seçib səbətə əlavə edin, sonra ödənişi kart vasitəsilə tamamlayın. Bilet ödənişdən sonra email-inizə göndərilir.",
  },
  {
    q: "Bileti geri qaytara bilərəmmi?",
    a: "Qaytarma tədbir təşkilatçısının şərtlərindən asılıdır. Tamamlanmış sifarişiniz üçün «Qaytarma sorğuları» bölməsindən müraciət edə bilərsiniz.",
  },
  {
    q: "Bileti başqasına necə göndərim?",
    a: "«Transferlər» bölməsindən bileti qeydiyyatdan keçmiş digər istifadəçiyə göndərə bilərsiniz. Qarşı tərəf transferi təsdiqləməlidir.",
  },
  {
    q: "Ödəniş getdi, bilet gəlmədi. Nə etməliyəm?",
    a: "«Sifarişlər» bölməsində sifarişin statusunu yoxlayın. Status «Ödəniş gözlənilir» olaraq qalırsa, bir neçə dəqiqə gözləyin və ya dəstəyə yazın.",
  },
  {
    q: "iGift hədiyyə kartını necə istifadə edim?",
    a: "«iGift hədiyyə kartı» bölməsində kartın kodunu daxil edib aktivləşdirin. Məbləğ cüzdanınıza əlavə olunur.",
  },
  {
    q: "Bilet PIN kodu nə üçündür?",
    a: "PIN kod sifarişinizi kassada və ya girişdə təsdiqləmək üçündür. Onu yalnız etibar etdiyiniz şəxslərlə paylaşın.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>Ən çox verilən suallar</h1>
      </div>

      <div className="faq-list">
        {QUESTIONS.map((item, i) => (
          <div className="profile-accordion" key={item.q}>
            <button
              type="button"
              className="profile-accordion-head"
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              aria-expanded={openIndex === i}
            >
              {item.q}
              <span className={openIndex === i ? "rotated" : undefined}>
                <ChevronIcon />
              </span>
            </button>
            {openIndex === i && (
              <p className="profile-accordion-body">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
