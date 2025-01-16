export default {
    app: {
      port: 3000, // Example port number for local environment
    },
    db: {
      url: 'postgres://postgres:root@localhost:5432/postgres'
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