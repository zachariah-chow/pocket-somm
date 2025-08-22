/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'pocket-somm',
      home: 'aws',
      providers: { aws: { region: 'ap-southeast-1', profile: 'pocket-somme' } },
      removal: input?.stage === 'prod' ? 'retain' : 'remove',
    };
  },
  async run() {
    // const isProd = $app.stage === 'prod';

    const uploads = new sst.aws.Bucket('UploadsBucket', {
      cors: {
        allowOrigins: ['*'],
        allowMethods: ['PUT', 'GET', 'HEAD', 'POST'],
        allowHeaders: ['*'],
      },
    });

    const web = new sst.aws.Nextjs('PocketSomme', {
      path: 'apps/web',
      link: [uploads],
    });

    return { websiteUrl: web.url, uploadsBucket: uploads.name };
  },
});
