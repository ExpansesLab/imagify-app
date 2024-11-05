import { Metadata } from "next";
import FooterSection from "../../../components/Footer/FooterSection";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
};

export default function PrivacyPolicy() {
  return (
    <main className="pt-4 relative z-50">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-10 lg:pb-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Политика конфиденциальности</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Общие положения</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Настоящая политика конфиденциальности (далее – «Политика») разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Оператором персональных данных является [Наименование компании] (ОГРН: [номер], ИНН: [номер], адрес: [юридический адрес]) (далее – «Оператор»).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Правовые основания обработки персональных данных</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Обработка персональных данных осуществляется на следующих правовых основаниях:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
                <li>Конституция РФ</li>
                <li>Федеральный закон от 27.07.2006 № 152-ФЗ «О персональных данных»</li>
                <li>Согласие пользователя на обработку персональных данных</li>
                <li>Договор, стороной которого является субъект персональных данных</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Перечень обрабатываемых персональных данных</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Оператор обрабатывает следующие категории персональных данных:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
                <li>Фамилия, имя, отчество</li>
                <li>Адрес электронной почты</li>
                <li>Данные учетной записи</li>
                <li>Платежная информация</li>
                <li>IP-адрес и данные о посещении сайта</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Цели обработки персональных данных</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Оператор обрабатывает персональные данные в следующих целях:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
                <li>Исполнение договора на оказание услуг</li>
                <li>Обработка платежей</li>
                <li>Улучшение качества услуг</li>
                <li>Отправка информационных сообщений</li>
                <li>Техническая поддержка пользователей</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Сроки обработки персональных данных</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Персональные данные обрабатываются до момента достижения целей обработки персональных данных, в частности:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
                <li>В течение срока действия договора на оказание услуг</li>
                <li>До момента удаления учетной записи пользователем</li>
                <li>В течение срока, установленного законодательством РФ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Передача персональных данных</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Оператор вправе передавать персональные данные третьим лицам в следующих случаях:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
                <li>С согласия субъекта персональных данных</li>
                <li>По требованию законодательства РФ</li>
                <li>Для оказания услуг (процессинговым компаниям, техническим подрядчикам)</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                При трансграничной передаче данных Оператор обеспечивает адекватную защиту прав субъектов персональных данных.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Права субъекта персональных данных</h2>
              <p className="text-gray-600 dark:text-gray-300">
                В соответствии с законодательством РФ субъект персональных данных имеет право:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
                <li>На получение информации об обработке персональных данных</li>
                <li>Требовать уточнения или удаления персональных данных</li>
                <li>Отозвать согласие на обработку персональных данных</li>
                <li>Требовать прекращения обработки персональных данных</li>
                <li>Обжаловать действия или бездействие Оператора</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Меры по защите персональных данных</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Оператор принимает необходимые и достаточные правовые, организационные и технические меры для защиты персональных данных от неправомерного доступа, уничтожения, изменения, блокирования, копирования, предоставления, распространения, а также от иных неправомерных действий.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Изменение политики конфиденциальности</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Оператор имеет право вносить изменения в настоящую Политику. Новая редакция Политики вступает в силу с момента ее размещения на сайте, если иное не предусмотрено новой редакцией Политики.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Контактная информация</h2>
              <p className="text-gray-600 dark:text-gray-300">
                По всем вопросам, связанным с обработкой персональных данных, можно обращаться:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
                <li>По электронной почте: [email]</li>
                <li>По адресу: [почтовый адрес]</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
      <FooterSection />
    </main>
  );
}
