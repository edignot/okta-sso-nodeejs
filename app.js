const express = require('express')
require('dotenv').config()

// 1. Install and import WorkOS SDK
const WorkOS = require('@workos-inc/node').default
// 2. Initialize WorkOS client with WorkOS API Key
const workos = new WorkOS(process.env.WORKOS_API_KEY)
// 3. Add Client ID that is specific to environment in WorkOS dashboard
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
      // 4. Connection ID associated with SSO Connection in WorkOS dashboard
      connection: 'conn_01G2TM1BYXCPFB5Y12WN7FK2DY',
      clientID: clientID,
      // 5. Endpoint that handles callback from WorkOS when user authenticates, optional, if not provided it will use default from WorkOS dashboard
      redirectURI: 'https://node-workos-okta-sso.herokuapp.com/callback',
    })
    // 6. Redirect user to uthorization URL
    res.redirect(authorizationURL)
  } catch (error) {
    console.log(error)
    res.render('index')
  }
})

app.get('/callback', async (req, res) => {
  // 7. Exchange authorization code for the user profile
  const { code } = req.query
  console.log('code', req.query)
  // 8. Make a call to WorkOS API to get user profile
  const { profile } = await workos.sso.getProfileAndToken({
    code,
    clientID: clientID,
  })

  user = profile
  // 9. Other logic after user successfully authenticates
  res.redirect('/account')
})

app.get('/account', (req, res) => {
  res.render('account', {
    profileInfo: JSON.stringify(user, null, 8),
  })
})

app.listen(PORT, () => console.info(`listening on port ${PORT}`))
