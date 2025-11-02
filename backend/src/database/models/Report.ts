import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../index'

interface ReportAttributes {
  id: string
  fund_id: string
  period_start: Date
  period_end: Date
  file_url?: string
  verified: boolean
  total_collected: number
  total_distributed: number
  created_at: Date
  updated_at: Date
}

interface ReportCreationAttributes extends Optional<ReportAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
  public id!: string
  public fund_id!: string
  public period_start!: Date
  public period_end!: Date
  public file_url?: string
  public verified!: boolean
  public total_collected!: number
  public total_distributed!: number
  public readonly created_at!: Date
  public readonly updated_at!: Date
}

Report.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fund_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'funds',
        key: 'id',
      },
    },
    period_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    period_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    total_collected: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_distributed: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'reports',
    timestamps: true,
    underscored: true,
  }
)

