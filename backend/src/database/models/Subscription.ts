import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../index'
import { addMonths } from 'date-fns'

interface SubscriptionAttributes {
  id: string
  user_id: string
  plan: 'basic' | 'pro' | 'premium'
  period: 'P1M' | 'P3M' | 'P6M' | 'P12M'
  provider: 'yookassa' | 'cloudpayments'
  provider_subscription_id?: string
  status: 'active' | 'paused' | 'canceled' | 'expired'
  next_charge_at?: Date
  created_at: Date
  updated_at: Date
}

interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> implements SubscriptionAttributes {
  public id!: string
  public user_id!: string
  public plan!: 'basic' | 'pro' | 'premium'
  public period!: 'P1M' | 'P3M' | 'P6M' | 'P12M'
  public provider!: 'yookassa' | 'cloudpayments'
  public provider_subscription_id?: string
  public status!: 'active' | 'paused' | 'canceled' | 'expired'
  public next_charge_at?: Date
  public readonly created_at!: Date
  public readonly updated_at!: Date

  public calculateNextChargeDate(): Date {
    const months = this.period === 'P1M' ? 1 : this.period === 'P3M' ? 3 : this.period === 'P6M' ? 6 : 12
    return addMonths(new Date(), months)
  }
}

Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    plan: {
      type: DataTypes.ENUM('basic', 'pro', 'premium'),
      allowNull: false,
    },
    period: {
      type: DataTypes.ENUM('P1M', 'P3M', 'P6M', 'P12M'),
      allowNull: false,
    },
    provider: {
      type: DataTypes.ENUM('yookassa', 'cloudpayments'),
      allowNull: false,
    },
    provider_subscription_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'canceled', 'expired'),
      defaultValue: 'active',
    },
    next_charge_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true,
  }
)

