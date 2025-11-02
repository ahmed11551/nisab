import { sequelize } from '../index'
import { User } from './User'
import { Fund } from './Fund'
import { Donation } from './Donation'
import { Subscription } from './Subscription'
import { DerivedAlms } from './DerivedAlms'
import { ZakatCalc } from './ZakatCalc'
import { Campaign } from './Campaign'
import { PartnerApplication } from './PartnerApplication'
import { Report } from './Report'

// Define associations
Donation.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
Donation.belongsTo(Fund, { foreignKey: 'fund_id', as: 'fund' })
Donation.belongsTo(Campaign, { foreignKey: 'campaign_id', as: 'campaign' })

Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

DerivedAlms.belongsTo(User, { foreignKey: 'user_id' })
DerivedAlms.belongsTo(Subscription, { foreignKey: 'subscription_id' })
DerivedAlms.belongsTo(Fund, { foreignKey: 'fund_id' })

ZakatCalc.belongsTo(User, { foreignKey: 'user_id' })

Campaign.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' })
Campaign.belongsTo(Fund, { foreignKey: 'fund_id' })

PartnerApplication.belongsTo(User, { foreignKey: 'user_id' })

Report.belongsTo(Fund, { foreignKey: 'fund_id' })

export {
  sequelize,
  User,
  Fund,
  Donation,
  Subscription,
  DerivedAlms,
  ZakatCalc,
  Campaign,
  PartnerApplication,
  Report,
}

