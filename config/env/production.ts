export default {
  app: {
    port: 5002, 
  },
  db: {
    url: 'postgres://lmclub_admin:l5hRgtMrXRCUk58L28fL@lmclub-dev.c5lb9erjkfsl.us-east-1.rds.amazonaws.com:5432/prod_lmclub'
  },
  /*smtp: {
    host: 'smtp.office365.com',
    user: 'info@laoemaom.club',
    port: 567,
    secure: false,
    password: '###Meher123%'
  },*/

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
    from: '+18554915096'
  },
  jwt: {
    secretKey: 'LMSecretCLUB'
  },
  payment: {
    merchantId: 'f7rw9fx9c5vhrw2x',
    publicKey: 'hq69kfcbw5vzs4rx',
    privateKey: 'd000efce365055e41a6a5b8f87f62e7c'
  },
  s3: {
    bucketName: 'prodlmclub',
    accessKeyId: 'AKIARWKGVWYF5Z6CGZBG',
    secretAccessKey: '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',
    region: 'us-east-1',
    accelerateUrl: 'prodlmclub.s3-accelerate.amazonaws.com',
    cloudfrontUrl: 'https://d1rugkt92rz6qz.cloudfront.net/'
  }
};

// Accelerated endpoint/url  : prodlmclub.s3-accelerate.amazonaws.com
// cloudfront url : https://d1rugkt92rz6qz.cloudfront.net/
