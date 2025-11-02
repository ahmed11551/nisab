import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../index'

interface PartnerApplicationAttributes {
  id: string
  user_id?: string
  org_name: string
  country_code: string
  categories: string[]
  website: string
  contact_name: string
  email: string
  phone?: string
  about?: string
  status: 'received' | 'in_review' | 'approved' | 'rejected'
  consents: {
    privacy: boolean
    terms: boolean
  }
  reviewer_id?: string
  comment?: string
  created_at: Date
  reviewed_at?: Date
  updated_at: Date
}

interface PartnerApplicationCreationAttributes extends Optional<PartnerApplicationAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class PartnerApplication extends Model<PartnerApplicationAttributes, PartnerApplicationCreationAttributes> implements PartnerApplicationAttributes {
  public id!: string
  public user_id?: string
  public org_name!: string
  public country_code!: string
  public categories!: string[]
  public website!: string
  public contact_name!: string
  public email!: string
  public phone?: string
  public about?: string
  public status!: 'received' | 'in_review' | 'approved' | 'rejected'
  public consents!: {
    privacy: boolean
    terms: boolean
  }
  public reviewer_id?: string
  public comment?: string
  public readonly created_at!: Date
  public reviewed_at?: Date
  public readonly updated_at!: Date
}

PartnerApplication.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    org_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country_code: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    categories: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    website: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('received', 'in_review', 'approved', 'rejected'),
      defaultValue: 'received',
    },
    consents: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    reviewer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reviewed_at: {
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
    tableName: 'partner_applications',
    timestamps: true,
    underscored: true,
  }
)

