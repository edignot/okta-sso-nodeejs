const express = require('express')
require('dotenv').config()

const WorkOS = require('@workos-inc/node').default
const workos = new WorkOS(process.env.WORKOS_API_KEY)
const clientID = process.env.WORKOS_CLIENT_ID

const app = express()
const PORT = process.env.PORT || 3000

let user = {}

app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))
app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/login', (_req, res) => {
  try {
    const authorizationURL = workos.sso.getAuthorizationURL({
      connection: 'conn_01G287ZATJG4AX65S19FKFWQ90',
      clientID: clientID,
      redirectURI: 'https://node-ejs-okta-sso-workos.herokuapp.com/callback',
    })
    res.redirect(authorizationURL)
  } catch (error) {
    res.render('index', { text: error })
  }
})

app.get('/callback', async (req, res) => {
  const { code } = req.query
  const { profile } = await workos.sso.getProfileAndToken({
    code,
    clientID: clientID,
  })

  user = profile
  res.redirect('/account')
})

app.get('/account', (req, res) => {
  res.render('account', {
    profileInfo: JSON.stringify(user, null, 8),
  })
})

app.listen(PORT, () => console.info(`listening on port ${PORT}`))
