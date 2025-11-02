import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../index'

interface DerivedAlmsAttributes {
  id: string
  subscription_id: string
  user_id: string
  percent: number
  amount_value: number
  currency: string
  fund_id: string
  created_at: Date
}

interface DerivedAlmsCreationAttributes extends Optional<DerivedAlmsAttributes, 'id' | 'created_at'> {}

export class DerivedAlms extends Model<DerivedAlmsAttributes, DerivedAlmsCreationAttributes> implements DerivedAlmsAttributes {
  public id!: string
  public subscription_id!: string
  public user_id!: string
  public percent!: number
  public amount_value!: number
  public currency!: string
  public fund_id!: string
  public readonly created_at!: Date
}

DerivedAlms.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subscription_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subscriptions',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    amount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'RUB',
    },
    fund_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'funds',
        key: 'id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'derived_alms',
    timestamps: false,
    underscored: true,
  }
)

