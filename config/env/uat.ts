export default {
  app: {
    port: 5001, // Example port number for local environment
  },
  db: {
    url: 'postgres://postgres:NbvGvDqkWgwDPH4A0T92@lmclub-dev.c5lb9erjkfsl.us-east-1.rds.amazonaws.com:5432/uat_lmclub'
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

  // Sandbox--
  // Merchant ID: f7rw9fx9c5vhrw2x
  // Public Key: hq69kfcbw5vzs4rx
  // Private Key: d000efce365055e41a6a5b8f87f62e7c
  // Tokenization Key: sandbox_kt6pqmdd_f7rw9fx9c5vhrw2x

  payment: {
    merchantId: 'f7rw9fx9c5vhrw2x',
    publicKey: 'hq69kfcbw5vzs4rx',
    privateKey: 'd000efce365055e41a6a5b8f87f62e7c'
  },
  s3: {
    bucketName: 'uatlmclub',
    accessKeyId: 'AKIARWKGVWYF7O45EBWP',
    secretAccessKey: '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',
    region: 'us-east-1',
    accelerateUrl: 'uatlmclub.s3-accelerate.amazonaws.com',
    cloudfrontUrl: 'https://d1dkexle3mnl9z.cloudfront.net/'
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