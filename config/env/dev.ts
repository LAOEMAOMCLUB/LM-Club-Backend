export default {
    app: {
      port: 5000, // Example port number for local environment
    },
    db: {
      url: 'postgres://postgres:NbvGvDqkWgwDPH4A0T92@lmclub-dev.c5lb9erjkfsl.us-east-1.rds.amazonaws.com:5432/lmclub'
    },
    smtp: {
      host: 'smtp.office365.com',
      user: 'noreply@sparity.com',
      port: 567,
      secure: false,
      password: 'Xoy53746'
    },
    twilio: {
      accountSid: 'ACe26263bd307096a0257d1aabc283e48e',
      authToken: '02f974582de5e05dec2d524976931b10',
      from: '+18886884611'
    },
    jwt: {
      secretKey: 'LMSecretCLUB'
    },
    payment: {
      merchantId: 'vdq29wwb6hwck4s2',
      publicKey: '9t9z8x3ywthng7f3',
      privateKey: '66cfc4737fc424b2eda807a5a9460aa1'
    },
    s3: {
      bucketName: 'devlmclub',
      accessKeyId: 'AKIARWKGVWYFS5XGJJGP',
      secretAccessKey: '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',
      region: 'us-east-1',
      accelerateUrl: 'devlmclub.s3-accelerate.amazonaws.com',
      cloudfrontUrl: 'https://d18z17pxtm3qq3.cloudfront.net/'
    }
  };

//   SMTP_HOST='smtp.office365.com'
// SMTP_PORT=567
// SMTP_USER='noreply@sparity.com'
// SECURE=false
// SMTP_PASSWORD='Xoy53746'
// TWILIO_ACCOUNT_SID='ACe26263bd307096a0257d1aabc283e48e'
// TWILIO_AUTH_TOKEN='02f974582de5e05dec2d524976931b10'
// TWILIO_FROM='+18886884611'
// JWT_SECRET_KEY='LMSecretCLUB'
// MERCHANTID='vdq29wwb6hwck4s2'
// PAYMENTPUBLICKEY='9t9z8x3ywthng7f3'
// PAYMENTPRIVATEKEY='66cfc4737fc424b2eda807a5a9460aa1'
// BUCKETNAME='devlmclub'
// ACCESSKEYID='AKIARWKGVWYFS5XGJJGP'
// SECRETACCESSKEY='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'
// REGION='us-east-1'
// ACCELERATEURL='devlmclub.s3-accelerate.amazonaws.com'
// CLOUDFRONTURL='https://d18z17pxtm3qq3.cloudfront.net/'