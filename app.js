const express = require('express')
require('dotenv').config()
const WorkOS = require('@workos-inc/node').default
const app = express()
const PORT = process.env.PORT || 3000

const workos = new WorkOS(process.env.WORKOS_API_KEY)
const clientID = process.env.WORKOS_CLIENT_ID

app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))

app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index', { text: 'Please log in' })
})

app.get('/account', (req, res) => {
  res.render('account', { text: 'SUCCESS' })
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
  // display profile info
  console.log(profile)
  res.redirect('/account')
})

app.listen(PORT, () => console.info(`listening on port ${PORT}`))
