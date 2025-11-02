import { Request, Response, NextFunction } from 'express'
import { partnersService } from '../services/partners'

class PartnersController {
  async getCountries(req: Request, res: Response, next: NextFunction) {
    try {
      const countries = await partnersService.getCountries()
      res.json({
        success: true,
        data: countries,
      })
    } catch (error) {
      next(error)
    }
  }

  async getFunds(req: Request, res: Response, next: NextFunction) {
    try {
      const { country, categories, search, from = 0, size = 20 } = req.query

      const funds = await partnersService.getFunds({
        country: country as string,
        categories: categories as string,
        search: search as string,
        from: parseInt(from as string, 10),
        size: parseInt(size as string, 10),
      })

      res.json({
        success: true,
        data: funds,
      })
    } catch (error) {
      next(error)
    }
  }

  async submitApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      const application = await partnersService.submitApplication({
        userId,
        ...req.body,
      })

      res.json({
        success: true,
        data: application,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const partnersController = new PartnersController()

