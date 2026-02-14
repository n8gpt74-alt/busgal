// Шаблоны документов для малого бизнеса
export interface DocumentTemplate {
  id: string
  name: string
  category: 'dogovor' | 'akt' | 'schet' | 'doverennost' | 'zayavlenie' | 'kadry' | 'finansy'
  description: string
  fields: TemplateField[]
  content: string
}

export interface TemplateField {
  name: string
  label: string
  required: boolean
  type: 'text' | 'date' | 'number' | 'phone' | 'inn' | 'kpp' | 'address'
  placeholder?: string
}

export const documentTemplates: DocumentTemplate[] = [
  // Договор подряда
  {
    id: 'dogovor-podryada',
    name: 'Договор подряда',
    category: 'dogovor',
    description: 'Договор на выполнение работ между заказчиком и подрядчиком',
    fields: [
      { name: 'dogovorNumber', label: 'Номер договора', required: true, type: 'text', placeholder: '№ 1' },
      { name: 'date', label: 'Дата заключения', required: true, type: 'date' },
      { name: 'investorName', label: 'Заказчик (ФИО/Название)', required: true, type: 'text', placeholder: 'Иванов Иван Иванович' },
      { name: 'investorINN', label: 'ИНН заказчика', required: true, type: 'inn' },
      { name: 'investorAddress', label: 'Адрес заказчика', required: true, type: 'address' },
      { name: 'contractorName', label: 'Подрядчик (ФИО/Название)', required: true, type: 'text', placeholder: 'Петров Петр Петрович' },
      { name: 'contractorINN', label: 'ИНН подрядчика', required: true, type: 'inn' },
      { name: 'contractorAddress', label: 'Адрес подрядчика', required: true, type: 'address' },
      { name: 'workDescription', label: 'Предмет работы', required: true, type: 'text', placeholder: 'Выполнение ремонтных работ' },
      { name: 'cost', label: 'Стоимость работ (руб)', required: true, type: 'number' },
      { name: 'paymentMethod', label: 'Порядок оплаты', required: true, type: 'text', placeholder: 'После подписания акта' }
    ],
    content: `ДОГОВОР ПОДРЯДА
№ {{dogovorNumber}}
{{date}}

{{investorName}} (ИНН {{investorINN}}), далее "Заказчик", и {{contractorName}} (ИНН {{contractorINN}}), далее "Подрядчик", заключили договор:

1. ПРЕДМЕТ
Заказчик поручает, а Подрядчик принимает обязательства: {{workDescription}}

2. СТОИМОСТЬ
Стоимость работ: {{cost}} руб.

3. СРОКИ
Срок: с {{startDate}} по {{endDate}}

4. ОПЛАТА
{{paymentMethod}}

ЗАКАЗЧИК: {{investorName}}
ПОДРЯДЧИК: {{contractorName}}`
  },

  // Договор на оказание услуг
  {
    id: 'dogovor-uslug',
    name: 'Договор услуг',
    category: 'dogovor',
    description: 'Договор на оказание услуг между заказчиком и исполнителем',
    fields: [
      { name: 'dogovorNumber', label: 'Номер договора', required: true, type: 'text' },
      { name: 'date', label: 'Дата', required: true, type: 'date' },
      { name: 'customerName', label: 'Заказчик', required: true, type: 'text' },
      { name: 'customerINN', label: 'ИНН заказчика', required: true, type: 'inn' },
      { name: 'executorName', label: 'Исполнитель', required: true, type: 'text' },
      { name: 'executorINN', label: 'ИНН исполнителя', required: true, type: 'inn' },
      { name: 'serviceDescription', label: 'Описание услуги', required: true, type: 'text' },
      { name: 'cost', label: 'Стоимость', required: true, type: 'number' }
    ],
    content: `ДОГОВОР НА ОКАЗАНИЕ УСЛУГ
№ {{dogovorNumber}}
{{date}}

{{customerName}} (ИНН {{customerINN}}), далее "Заказчик", и {{executorName}} (ИНН {{executorINN}}), далее "Исполнитель", заключили договор:

1. ПРЕДМЕТ
Исполнитель обязуется оказать услуги: {{serviceDescription}}

2. СТОИМОСТЬ
Стоимость услуг: {{cost}} руб.

Заказчик: _____________ /{{customerName}}/
Исполнитель: _____________ /{{executorName}}/`
  },

  // Договор аренды
  {
    id: 'dogovor-arendy',
    name: 'Договор аренды',
    category: 'dogovor',
    description: 'Договор аренды помещения или оборудования',
    fields: [
      { name: 'dogovorNumber', label: 'Номер договора', required: true, type: 'text' },
      { name: 'date', label: 'Дата', required: true, type: 'date' },
      { name: 'landlordName', label: 'Арендодатель', required: true, type: 'text' },
      { name: 'tenantName', label: 'Арендатор', required: true, type: 'text' },
      { name: 'propertyDescription', label: 'Описание имущества', required: true, type: 'text' },
      { name: 'address', label: 'Адрес', required: true, type: 'address' },
      { name: 'rentAmount', label: 'Арендная плата (руб/мес)', required: true, type: 'number' }
    ],
    content: `ДОГОВОР АРЕНДЫ
№ {{dogovorNumber}}
{{date}}

Арендодатель: {{landlordName}}
Арендатор: {{tenantName}}

1. ПРЕДМЕТ
{{propertyDescription}}
Адрес: {{address}}

2. АРЕНДНАЯ ПЛАТА
{{rentAmount}} руб./месяц

Арендодатель: _____________ /{{landlordName}}/
Арендатор: _____________ /{{tenantName}}/`
  },

  // Акт выполненных работ
  {
    id: 'akt-vypolnennych-rabot',
    name: 'Акт выполненных работ',
    category: 'akt',
    description: 'Акт сдачи-приемки выполненных работ',
    fields: [
      { name: 'aktNumber', label: 'Номер акта', required: true, type: 'text', placeholder: '№ 1' },
      { name: 'date', label: 'Дата составления', required: true, type: 'date' },
      { name: 'dogovorReference', label: 'Ссылка на договор', required: true, type: 'text', placeholder: 'Договор подряда №' },
      { name: 'customerName', label: 'Заказчик', required: true, type: 'text' },
      { name: 'executorName', label: 'Исполнитель', required: true, type: 'text' },
      { name: 'workList', label: 'Перечень работ', required: true, type: 'text' },
      { name: 'totalAmount', label: 'Сумма (руб)', required: true, type: 'number' }
    ],
    content: `АКТ № {{aktNumber}}
сдачи-приемки выполненных работ
{{date}}

Заказчик: {{customerName}}
Исполнитель: {{executorName}}

Выполнены работы: {{workList}}

Сумма: {{totalAmount}} руб.

Заказчик: _____________ /____________/
Исполнитель: _____________ /____________/`
  },

  // Акт сверки
  {
    id: 'akt-sverki',
    name: 'Акт сверки',
    category: 'akt',
    description: 'Акт сверки взаиморасчётов между сторонами',
    fields: [
      { name: 'aktNumber', label: 'Номер акта', required: true, type: 'text' },
      { name: 'date', label: 'Дата', required: true, type: 'date' },
      { name: 'company1', label: 'Первая сторона', required: true, type: 'text' },
      { name: 'company2', label: 'Вторая сторона', required: true, type: 'text' },
      { name: 'period', label: 'Период сверки', required: true, type: 'text' },
      { name: 'debtAmount', label: 'Сумма задолженности', required: true, type: 'number' }
    ],
    content: `АКТ СВЕРКИ ВЗАИМОРАСЧЁТОВ
№ {{aktNumber}}
{{date}}

{{company1}}
и {{company2}}

Период сверки: {{period}}
Задолженность: {{debtAmount}} руб.

Стороны претензий не имеют.

{{company1}}: _____________ /____________/
{{company2}}: _____________ /____________/`
  },

  // Счет на оплату
  {
    id: 'schet-na-oplatu',
    name: 'Счет на оплату',
    category: 'schet',
    description: 'Счет на оплату товаров или услуг',
    fields: [
      { name: 'schetNumber', label: 'Номер счета', required: true, type: 'text', placeholder: '№ 1' },
      { name: 'date', label: 'Дата', required: true, type: 'date' },
      { name: 'sellerName', label: 'Продавец', required: true, type: 'text' },
      { name: 'sellerINN', label: 'ИНН продавца', required: true, type: 'inn' },
      { name: 'buyerName', label: 'Покупатель', required: true, type: 'text' },
      { name: 'buyerINN', label: 'ИНН покупателя', required: true, type: 'inn' },
      { name: 'items', label: 'Товары/услуги', required: true, type: 'text' },
      { name: 'totalAmount', label: 'Сумма к оплате', required: true, type: 'number' }
    ],
    content: `СЧЕТ № {{schetNumber}}
на оплату
{{date}}

Продавец: {{sellerName}}, ИНН {{sellerINN}}
Покупатель: {{buyerName}}, ИНН {{buyerINN}}

Товары/услуги: {{items}}
Итого: {{totalAmount}} руб.

Руководитель: _____________ /____________/
Гл. бухгалтер: _____________ /____________/`
  },

  // Коммерческое предложение
  {
    id: 'kommercheskoe-predlozhenie',
    name: 'Коммерческое предложение',
    category: 'schet',
    description: 'Коммерческое предложение для клиента',
    fields: [
      { name: 'kpNumber', label: 'Номер КП', required: true, type: 'text' },
      { name: 'date', label: 'Дата', required: true, type: 'date' },
      { name: 'companyName', label: 'Наша компания', required: true, type: 'text' },
      { name: 'clientName', label: 'Клиент', required: true, type: 'text' },
      { name: 'productService', label: 'Товар/услуга', required: true, type: 'text' },
      { name: 'price', label: 'Цена', required: true, type: 'number' }
    ],
    content: `КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ
№ {{kpNumber}}
{{date}}

ОТ: {{companyName}}
КОМУ: {{clientName}}

Уважаемые коллеги!

Предлагаем: {{productService}}
Цена: {{price}} руб.

С уважением,
{{companyName}}`
  },

  // Доверенность
  {
    id: 'doverennost',
    name: 'Доверенность',
    category: 'doverennost',
    description: 'Доверенность на представление интересов',
    fields: [
      { name: 'doverennostNumber', label: 'Номер доверенности', required: true, type: 'text' },
      { name: 'date', label: 'Дата выдачи', required: true, type: 'date' },
      { name: 'principalName', label: 'Доверитель (ФИО)', required: true, type: 'text' },
      { name: 'representativeName', label: 'Представитель (ФИО)', required: true, type: 'text' },
      { name: 'powers', label: 'Полномочия', required: true, type: 'text' },
      { name: 'validUntil', label: 'Срок действия', required: true, type: 'date' }
    ],
    content: `ДОВЕРЕННОСТЬ № {{doverennostNumber}}
{{date}}

Я, {{principalName}}, настоящей доверенностью уполномочиваю
{{representativeName}}

представлять мои интересы: {{powers}}

Доверенность действительна до {{validUntil}}.

Подпись: _____________ /{{principalName}}/`
  },

  // Заявление на УСН
  {
    id: 'zayavlenie-usn',
    name: 'Заявление на УСН',
    category: 'zayavlenie',
    description: 'Заявление о переходе на упрощённую систему налогообложения',
    fields: [
      { name: 'fio', label: 'ФИО ИП', required: true, type: 'text' },
      { name: 'inn', label: 'ИНН', required: true, type: 'inn' },
      { name: 'ogrnip', label: 'ОГРНИП', required: true, type: 'text' },
      { name: 'address', label: 'Адрес регистрации', required: true, type: 'address' },
      { name: 'taxService', label: 'Налоговая инспекция', required: true, type: 'text' },
      { name: 'object', label: 'Объект налогообложения', required: true, type: 'text' },
      { name: 'date', label: 'Дата', required: true, type: 'date' }
    ],
    content: `В налоговую инспекцию {{taxService}}

ЗАЯВЛЕНИЕ
о переходе на упрощённую систему налогообложения

Я, {{fio}}, ИНН {{inn}}, ОГРНИП {{ogrnip}}, адрес: {{address}}, прошу перевести меня на УСН с объектом {{object}}.

Дата: {{date}}
_____________ /{{fio}}/`
  },

  // Реестр документов
  {
    id: 'reestr-dokumentov',
    name: 'Реестр документов',
    category: 'zayavlenie',
    description: 'Опись документов для налоговой или архива',
    fields: [
      { name: 'reestrNumber', label: 'Номер реестра', required: true, type: 'text' },
      { name: 'date', label: 'Дата', required: true, type: 'date' },
      { name: 'organization', label: 'Организация', required: true, type: 'text' },
      { name: 'documentCount', label: 'Количество документов', required: true, type: 'number' },
      { name: 'totalSheets', label: 'Общее количество листов', required: true, type: 'number' }
    ],
    content: `РЕЕСТР ДОКУМЕНТОВ
№ {{reestrNumber}}
{{date}}

Организация: {{organization}}
Количество документов: {{documentCount}}
Всего листов: {{totalSheets}}

Составил: _____________ /____________/
Проверил: _____________ /____________/`
  },

  // Трудовой договор
  {
    id: 'trudovoy-dogovor',
    name: 'Трудовой договор',
    category: 'kadry',
    description: 'Трудовой договор с сотрудником',
    fields: [
      { name: 'dogovorNumber', label: 'Номер договора', required: true, type: 'text' },
      { name: 'date', label: 'Дата', required: true, type: 'date' },
      { name: 'employerName', label: 'Работодатель', required: true, type: 'text' },
      { name: 'employeeFIO', label: 'Сотрудник (ФИО)', required: true, type: 'text' },
      { name: 'position', label: 'Должность', required: true, type: 'text' },
      { name: 'salary', label: 'Оклад (руб)', required: true, type: 'number' }
    ],
    content: `ТРУДОВОЙ ДОГОВОР
№ {{dogovorNumber}}
{{date}}

РАБОТОДАТЕЛЬ: {{employerName}}
РАБОТНИК: {{employeeFIO}}

1. Должность: {{position}}
2. Оклад: {{salary}} руб.
3. Испытательный срок: 3 месяца
4. Режим работы: с 9:00 до 18:00

Руководитель: _____________ /____________/
Работник: _____________ /{{employeeFIO}}/`
  },

  // Приказ о приёме
  {
    id: 'prikaz-o-prieme',
    name: 'Приказ о приёме',
    category: 'kadry',
    description: 'Приказ о приёме сотрудника на работу',
    fields: [
      { name: 'prikazNumber', label: 'Номер приказа', required: true, type: 'text' },
      { name: 'date', label: 'Дата', required: true, type: 'date' },
      { name: 'employeeFIO', label: 'Сотрудник (ФИО)', required: true, type: 'text' },
      { name: 'position', label: 'Должность', required: true, type: 'text' },
      { name: 'startDate', label: 'Дата начала работы', required: true, type: 'date' }
    ],
    content: `ПРИКАЗ № {{prikazNumber}}
о приёме на работу
{{date}}

Принять на работу:
{{employeeFIO}}
Должность: {{position}}
Дата начала работы: {{startDate}}

Руководитель: _____________ /____________/`
  },

  // Заявление на увольнение
  {
    id: 'zayavlenie-na-uvolnenie',
    name: 'Заявление на увольнение',
    category: 'kadry',
    description: 'Заявление сотрудника об увольнении',
    fields: [
      { name: 'fio', label: 'ФИО сотрудника', required: true, type: 'text' },
      { name: 'date', label: 'Дата', required: true, type: 'date' },
      { name: 'lastWorkDay', label: 'Последний рабочий день', required: true, type: 'date' }
    ],
    content: `Директору {{companyName}}
от {{fio}}

ЗАЯВЛЕНИЕ

Прошу уволить меня по собственному желанию {{lastWorkDay}}.

{{date}}
_____________ /{{fio}}/`
  },

  // Платёжное поручение
  {
    id: 'platezhnoe-poruchenie',
    name: 'Платёжное поручение',
    category: 'finansy',
    description: 'Платёжное поручение для банка',
    fields: [
      { name: 'docNumber', label: 'Номер документа', required: true, type: 'text' },
      { name: 'date', label: 'Дата', required: true, type: 'date' },
      { name: 'senderBank', label: 'Банк отправителя', required: true, type: 'text' },
      { name: 'senderScore', label: 'Счёт отправителя', required: true, type: 'text' },
      { name: 'recipientBank', label: 'Банк получателя', required: true, type: 'text' },
      { name: 'recipientScore', label: 'Счёт получателя', required: true, type: 'text' },
      { name: 'recipientName', label: 'Получатель', required: true, type: 'text' },
      { name: 'sum', label: 'Сумма (руб)', required: true, type: 'number' },
      { name: 'purpose', label: 'Назначение платежа', required: true, type: 'text' }
    ],
    content: `ПЛАТЁЖНОЕ ПОРУЧЕНИЕ № {{docNumber}}
{{date}}

Банк отправителя: {{senderBank}}
Счёт: {{senderScore}}

Банк получателя: {{recipientBank}}
Счёт: {{recipientScore}}
Получатель: {{recipientName}}

Сумма: {{sum}} руб.
Назначение: {{purpose}}

Руководитель: _____________ /____________/
Гл. бухгалтер: _____________ /____________/`
  },

  // Расходный кассовый ордер
  {
    id: 'raskhodny-kassoviy-order',
    name: 'Расходный ордер',
    category: 'finansy',
    description: 'Расходный кассовый ордер (РКО)',
    fields: [
      { name: 'rkoNumber', label: 'Номер РКО', required: true, type: 'text' },
      { name: 'date', label: 'Дата', required: true, type: 'date' },
      { name: 'sum', label: 'Сумма (руб)', required: true, type: 'number' },
      { name: 'reciever', label: 'Получатель', required: true, type: 'text' },
      { name: 'purpose', label: 'Основание', required: true, type: 'text' }
    ],
    content: `РАСХОДНЫЙ КАССОВЫЙ ОРДЕР № {{rkoNumber}}
{{date}}

Выдать: {{reciever}}
Сумма: {{sum}} руб.
Основание: {{purpose}}

Руководитель: _____________ /____________/
Кассир: _____________ /____________/
Получил: _____________ /{{reciever}}/`
  },

  // Приходный кассовый ордер
  {
    id: 'prikhodny-kassoviy-order',
    name: 'Приходный ордер',
    category: 'finansy',
    description: 'Приходный кассовый ордер (ПКО)',
    fields: [
      { name: 'pkoNumber', label: 'Номер ПКО', required: true, type: 'text' },
      { name: 'date', label: 'Дата', required: true, type: 'date' },
      { name: 'sum', label: 'Сумма (руб)', required: true, type: 'number' },
      { name: 'payer', label: 'От кого', required: true, type: 'text' },
      { name: 'purpose', label: 'Основание', required: true, type: 'text' }
    ],
    content: `ПРИХОДНЫЙ КАССОВЫЙ ОРДЕР № {{pkoNumber}}
{{date}}

Принято от: {{payer}}
Сумма: {{sum}} руб.
Основание: {{purpose}}

Руководитель: _____________ /____________/
Кассир: _____________ /____________/`
  }
]

// Функция для заполнения шаблона данными
export function fillTemplate(template: DocumentTemplate, data: Record<string, string>): string {
  let content = template.content
  
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    content = content.replace(regex, value || '')
  })
  
  return content
}

// Категории документов
export const documentCategories = [
  { id: 'dogovor', name: 'Договоры', icon: '📝' },
  { id: 'akt', name: 'Акты', icon: '✅' },
  { id: 'schet', name: 'Счета', icon: '💰' },
  { id: 'doverennost', name: 'Доверенности', icon: '📋' },
  { id: 'zayavlenie', name: 'Заявления', icon: '📃' },
  { id: 'kadry', name: 'Кадры', icon: '👥' },
  { id: 'finansy', name: 'Финансы', icon: '💵' }
]
