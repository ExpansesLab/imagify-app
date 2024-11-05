import { Metadata } from "next";
import FooterSection from "../../../components/Footer/FooterSection";

export const metadata: Metadata = {
  title: "Условия использования",
};

export default function TermsOfService() {
  return (
    <main className="pt-4 relative z-50">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-10 lg:pb-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Публичная оферта</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Общие положения</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Настоящий документ является публичной офертой [Наименование компании] (ОГРН: [номер], ИНН: [номер], адрес: [юридический адрес]) (далее – «Исполнитель») и содержит все существенные условия договора на оказание услуг по генерации изображений с использованием искусственного интеллекта (далее – «Услуги»).
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                В соответствии со статьей 437 Гражданского Кодекса Российской Федерации данный документ является публичной офертой, и в случае принятия изложенных ниже условий физическое или юридическое лицо (далее – «Заказчик») обязуется оплатить Услуги на условиях настоящей оферты.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Предмет договора</h2>
              <p className="text-gray-600 dark:text-gray-300">
                2.1. Исполнитель обязуется предоставить Заказчику доступ к сервису генерации изображений с использованием искусственного интеллекта на условиях, предусмотренных настоящей офертой.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                2.2. Описание, объем и стоимость Услуг указаны на сайте Исполнителя в разделе "Тарифы".
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Порядок заключения договора</h2>
              <p className="text-gray-600 dark:text-gray-300">
                3.1. Акцептом настоящей оферты является совершение Заказчиком следующих действий:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
                <li>Регистрация на сайте Исполнителя</li>
                <li>Оплата выбранного тарифа</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                3.2. Договор считается заключенным с момента поступления оплаты на счет Исполнителя.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Права и обязанности сторон</h2>
              <p className="text-gray-600 dark:text-gray-300">
                4.1. Исполнитель обязуется:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
                <li>Предоставить доступ к сервису в соответствии с выбранным тарифом</li>
                <li>Обеспечить техническую поддержку</li>
                <li>Сохранять конфиденциальность информации Заказчика</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mt-4">
                4.2. Заказчик обязуется:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
                <li>Своевременно оплачивать Услуги</li>
                <li>Не нарушать интеллектуальные права третьих лиц</li>
                <li>Не использовать сервис для создания противоправного контента</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Стоимость услуг и порядок оплаты</h2>
              <p className="text-gray-600 dark:text-gray-300">
                5.1. Стоимость Услуг определяется в соответствии с выбранным тарифом.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                5.2. Оплата производится в рублях РФ путем безналичного перевода на расчетный счет Исполнителя.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                5.3. Возврат средств осуществляется в соответствии с Законом РФ "О защите прав потребителей" в случае:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
                <li>Технической невозможности оказания Услуг</li>
                <li>Отказа от Услуг до начала их оказания</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Ответственность сторон</h2>
              <p className="text-gray-600 dark:text-gray-300">
                6.1. За неисполнение или ненадлежащее исполнение обязательств стороны несут ответственность в соответствии с законодательством РФ.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                6.2. Исполнитель не несет ответственности за:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
                <li>Контент, созданный Заказчиком с использованием сервиса</li>
                <li>Технические сбои, находящиеся вне контроля Исполнителя</li>
                <li>Убытки, возникшие не по вине Исполнителя</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Порядок разрешения споров</h2>
              <p className="text-gray-600 dark:text-gray-300">
                7.1. Все споры решаются путем переговоров. При невозможности достижения согласия спор передается на рассмотрение в суд по месту нахождения Исполнителя.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                7.2. До обращения в суд обязательно предъявление претензии. Срок ответа на претензию – 30 дней.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Срок действия и изменение условий</h2>
              <p className="text-gray-600 dark:text-gray-300">
                8.1. Оферта действует до момента отзыва Исполнителем.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                8.2. Исполнитель вправе изменять условия оферты. Изменения вступают в силу через 5 дней с момента публикации на сайте.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Реквизиты Исполнителя</h2>
              <p className="text-gray-600 dark:text-gray-300">
                [Наименование компании]<br />
                ОГРН: [номер]<br />
                ИНН: [номер]<br />
                КПП: [номер]<br />
                Юридический адрес: [адрес]<br />
                Расчетный счет: [номер]<br />
                Банк: [название]<br />
                БИК: [номер]<br />
                Корр. счет: [номер]<br />
                Email: [email]
              </p>
            </section>
          </div>
        </div>
      </div>
      <FooterSection />
    </main>
  );
}
