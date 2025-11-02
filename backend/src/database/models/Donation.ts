import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../index'

interface DonationAttributes {
  id: string
  user_id: string
  fund_id?: string
  campaign_id?: string
  purpose?: string
  amount_value: number
  currency: string
  provider: 'yookassa' | 'cloudpayments'
  status: 'created' | 'paid' | 'failed' | 'canceled'
  provider_payment_id?: string
  receipt_url?: string
  created_at: Date
  paid_at?: Date
  updated_at: Date
}

interface DonationCreationAttributes extends Optional<DonationAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Donation extends Model<DonationAttributes, DonationCreationAttributes> implements DonationAttributes {
  public id!: string
  public user_id!: string
  public fund_id?: string
  public campaign_id?: string
  public purpose?: string
  public amount_value!: number
  public currency!: string
  public provider!: 'yookassa' | 'cloudpayments'
  public status!: 'created' | 'paid' | 'failed' | 'canceled'
  public provider_payment_id?: string
  public receipt_url?: string
  public readonly created_at!: Date
  public paid_at?: Date
  public readonly updated_at!: Date
}

Donation.init(
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
    fund_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'funds',
        key: 'id',
      },
    },
    campaign_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'campaigns',
        key: 'id',
      },
    },
    purpose: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'RUB',
    },
    provider: {
      type: DataTypes.ENUM('yookassa', 'cloudpayments'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('created', 'paid', 'failed', 'canceled'),
      defaultValue: 'created',
    },
    provider_payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receipt_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'donations',
    timestamps: true,
    underscored: true,
  }
)

