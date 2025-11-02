import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../index'

interface ZakatCalcAttributes {
  id: string
  user_id: string
  payload_json: Record<string, any>
  zakat_due: number
  above_nisab: boolean
  nisab_value: number
  nisab_currency: string
  created_at: Date
  updated_at: Date
}

interface ZakatCalcCreationAttributes extends Optional<ZakatCalcAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class ZakatCalc extends Model<ZakatCalcAttributes, ZakatCalcCreationAttributes> implements ZakatCalcAttributes {
  public id!: string
  public user_id!: string
  public payload_json!: Record<string, any>
  public zakat_due!: number
  public above_nisab!: boolean
  public nisab_value!: number
  public nisab_currency!: string
  public readonly created_at!: Date
  public readonly updated_at!: Date
}

ZakatCalc.init(
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
    payload_json: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    zakat_due: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    above_nisab: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    nisab_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    nisab_currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'RUB',
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
    tableName: 'zakat_calculations',
    timestamps: true,
    underscored: true,
  }
)

