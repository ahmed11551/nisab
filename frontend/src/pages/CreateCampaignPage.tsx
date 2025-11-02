import { useNavigate } from 'react-router-dom'
import CampaignForm from '../components/CampaignForm'
import './CreateCampaignPage.css'

const CreateCampaignPage = () => {
  const navigate = useNavigate()

  return (
    <div className="create-campaign-page">
      <h1>Создать свою цель</h1>
      <p className="page-description">
        Создайте целевое пожертвование и привлеките других помочь вашему делу.
        После модерации кампания появится в каталоге.
      </p>

      <CampaignForm
        onSuccess={(campaignId) => {
          navigate(`/campaigns/${campaignId}`)
        }}
        onError={(error) => {
          console.error('Campaign creation error:', error)
        }}
      />
    </div>
  )
}

export default CreateCampaignPage

