import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../index'

interface CampaignAttributes {
  id: string
  title: string
  description: string
  category: string
  goal_amount: number
  collected_amount: number
  owner_id: string
  fund_id?: string
  country_code?: string
  image_url?: string
  status: 'draft' | 'pending' | 'approved' | 'active' | 'completed' | 'rejected'
  verified_by_admin?: boolean
  end_date?: Date
  created_at: Date
  updated_at: Date
}

interface CampaignCreationAttributes extends Optional<CampaignAttributes, 'id' | 'collected_amount' | 'created_at' | 'updated_at'> {}

export class Campaign extends Model<CampaignAttributes, CampaignCreationAttributes> implements CampaignAttributes {
  public id!: string
  public title!: string
  public description!: string
  public category!: string
  public goal_amount!: number
  public collected_amount!: number
  public owner_id!: string
  public fund_id?: string
  public country_code?: string
  public image_url?: string
  public status!: 'draft' | 'pending' | 'approved' | 'active' | 'completed' | 'rejected'
  public verified_by_admin?: boolean
  public end_date?: Date
  public readonly created_at!: Date
  public readonly updated_at!: Date
}

Campaign.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    goal_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    collected_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    owner_id: {
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
    country_code: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'active', 'completed', 'rejected'),
      defaultValue: 'pending',
    },
    verified_by_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    end_date: {
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
    tableName: 'campaigns',
    timestamps: true,
    underscored: true,
  }
)

