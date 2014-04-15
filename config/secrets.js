module.exports = {
  db: process.env.MONGODB|| 'mongodb://localhost:27017/test',

  sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here',

  localAuth: true,

  sendgrid: {
    user: process.env.SENDGRID_USER || 'theturrible',
    password: process.env.SENDGRID_PASSWORD || 'Hu1soska'
  },
  googleAuth: true,
  google: {
    clientID: process.env.GOOGLE_ID || '317890908511-6hu2ps1cm68g8qb761j51ggjsflpbfjs.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_SECRET || 'Jj8HfRqBh6COztN1TPamyCib',
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  }, 

  twilio: {
    sid: process.env.TWILIO_SID || 'Your Twilio SID',
    token: process.env.TWILIO_TOKEN || 'Your Twilio token'
  },
}

