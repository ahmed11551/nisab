import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../index'

interface FundAttributes {
  id: string
  name: string
  country_code: string
  purposes: string[]
  categories: string[]
  verified: boolean
  partner_enabled: boolean
  logo_url?: string
  short_desc?: string
  website?: string
  social_links: string[]
  active: boolean
  created_at: Date
  updated_at: Date
}

interface FundCreationAttributes extends Optional<FundAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Fund extends Model<FundAttributes, FundCreationAttributes> implements FundAttributes {
  public id!: string
  public name!: string
  public country_code!: string
  public purposes!: string[]
  public categories!: string[]
  public verified!: boolean
  public partner_enabled!: boolean
  public logo_url?: string
  public short_desc?: string
  public website?: string
  public social_links!: string[]
  public active!: boolean
  public readonly created_at!: Date
  public readonly updated_at!: Date
}

Fund.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country_code: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    purposes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    categories: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    partner_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    short_desc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    social_links: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'funds',
    timestamps: true,
    underscored: true,
  }
)

