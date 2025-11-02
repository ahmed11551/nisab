import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env')
  process.exit(1)
}

const commands = [
  { command: 'start', description: 'Главное меню с основными функциями' },
  { command: 'donate', description: 'Пожертвовать в фонды' },
  { command: 'sadaqa', description: 'Пожертвовать (альтернативная команда)' },
  { command: 'support', description: 'Поддержать проект' },
  { command: 'zakat', description: 'Калькулятор закята' },
  { command: 'subscribe', description: 'Подписки на регулярные пожертвования' },
  { command: 'help', description: 'Справка по использованию бота' },
  { command: 'info', description: 'Информация о боте' },
]

async function setCommands() {
  try {
    console.log('🔄 Регистрация команд бота...')
    
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`,
      { commands }
    )

    if (response.data.ok) {
      console.log('✅ Команды успешно зарегистрированы!')
      console.log('\n📋 Зарегистрированные команды:')
      commands.forEach((cmd) => {
        console.log(`   /${cmd.command} - ${cmd.description}`)
      })
      console.log('\n✅ Теперь команды доступны в списке команд бота!')
    } else {
      console.error('❌ Ошибка при регистрации команд:', response.data)
      process.exit(1)
    }
  } catch (error: any) {
    console.error('❌ Ошибка:', error.response?.data || error.message)
    process.exit(1)
  }
}

setCommands()

