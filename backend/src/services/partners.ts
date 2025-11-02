import { Fund } from '../database/models/Fund'
import { PartnerApplication } from '../database/models/PartnerApplication'
import { User } from '../database/models/User'
import { logger } from '../utils/logger'

class PartnersService {
  async getCountries() {
    const funds = await Fund.findAll({
      where: { partner_enabled: true, active: true },
      attributes: ['country_code'],
      group: ['country_code'],
      raw: true,
    })

    // Map country codes to names
    const countryNames: Record<string, string> = {
      RU: 'Россия',
      KZ: 'Казахстан',
      TR: 'Турция',
      UA: 'Украина',
      BY: 'Беларусь',
      UZ: 'Узбекистан',
      TJ: 'Таджикистан',
      KG: 'Кыргызстан',
      AZ: 'Азербайджан',
      AM: 'Армения',
      GE: 'Грузия',
      SA: 'Саудовская Аравия',
      AE: 'ОАЭ',
      QA: 'Катар',
      KW: 'Кувейт',
      BH: 'Бахрейн',
      OM: 'Оман',
      YE: 'Йемен',
      IQ: 'Ирак',
      IR: 'Иран',
      JO: 'Иордания',
      LB: 'Ливан',
      SY: 'Сирия',
      PS: 'Палестина',
      EG: 'Египет',
      LY: 'Ливия',
      TN: 'Тунис',
      DZ: 'Алжир',
      MA: 'Марокко',
      SD: 'Судан',
      SO: 'Сомали',
      ET: 'Эфиопия',
      KE: 'Кения',
      TZ: 'Танзания',
      UG: 'Уганда',
      MW: 'Малави',
      ZA: 'ЮАР',
      IN: 'Индия',
      PK: 'Пакистан',
      BD: 'Бангладеш',
      ID: 'Индонезия',
      MY: 'Малайзия',
      SG: 'Сингапур',
      TH: 'Таиланд',
      PH: 'Филиппины',
      VN: 'Вьетнам',
      MM: 'Мьянма',
      CN: 'Китай',
      JP: 'Япония',
      KR: 'Южная Корея',
      GB: 'Великобритания',
      US: 'США',
      CA: 'Канада',
      AU: 'Австралия',
      NZ: 'Новая Зеландия',
      DE: 'Германия',
      FR: 'Франция',
      IT: 'Италия',
      ES: 'Испания',
      NL: 'Нидерланды',
      BE: 'Бельгия',
      CH: 'Швейцария',
      AT: 'Австрия',
      SE: 'Швеция',
      NO: 'Норвегия',
      DK: 'Дания',
      FI: 'Финляндия',
      PL: 'Польша',
      CZ: 'Чехия',
      GR: 'Греция',
      PT: 'Португалия',
      IE: 'Ирландия',
      IS: 'Исландия',
      LU: 'Люксембург',
      MT: 'Мальта',
      CY: 'Кипр',
    }

    return funds.map((fund: any) => ({
      code: fund.country_code,
      name: countryNames[fund.country_code] || fund.country_code,
    }))
  }

  async getFunds(params: {
    country?: string
    categories?: string
    search?: string
    from?: number
    size?: number
  }) {
    const where: any = { partner_enabled: true, active: true }
    if (params.country) {
      where.country_code = params.country
    }
    if (params.categories) {
      const categories = params.categories.split(',')
      where.categories = { [require('sequelize').Op.overlap]: categories }
    }

    const funds = await Fund.findAll({
      where,
      limit: params.size || 20,
      offset: params.from || 0,
      order: [['verified', 'DESC']],
    })

    return {
      items: funds,
      total: await Fund.count({ where }),
    }
  }

  async submitApplication(data: {
    userId?: number
    org_name: string
    country_code: string
    categories: string[]
    website: string
    contact_name: string
    email: string
    phone?: string
    about?: string
    consents: { privacy: boolean; terms: boolean }
  }) {
    logger.info('Submitting partner application', data)

    let user = null
    if (data.userId) {
      user = await User.findOrCreate({
        where: { tg_id: data.userId },
        defaults: {
          tg_id: data.userId,
          first_name: data.contact_name,
        },
      })
    }

    const application = await PartnerApplication.create({
      user_id: user?.[0]?.id,
      org_name: data.org_name,
      country_code: data.country_code,
      categories: data.categories,
      website: data.website,
      contact_name: data.contact_name,
      email: data.email,
      phone: data.phone,
      about: data.about,
      consents: data.consents,
      status: 'received',
    })

    return {
      application_id: application.id,
      status: application.status,
    }
  }
}

export const partnersService = new PartnersService()

