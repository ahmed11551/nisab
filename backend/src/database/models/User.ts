import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../index'

interface UserAttributes {
  id: string
  tg_id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  locale?: string
  created_at: Date
  updated_at: Date
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string
  public tg_id!: number
  public first_name!: string
  public last_name?: string
  public username?: string
  public language_code?: string
  public locale?: string
  public readonly created_at!: Date
  public readonly updated_at!: Date
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tg_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    language_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    locale: {
      type: DataTypes.STRING(10),
      defaultValue: 'ru',
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
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
)

