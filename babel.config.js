module.exports = function(api) {
  const isTest = process.env.NODE_ENV === 'test';
  api.cache.using(() => process.env.NODE_ENV);
  
  if (isTest) {
    // Para testes, usar presets simples que não precisam de babel-preset-expo
    return {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript'
      ],
    };
  }
  
  // Para o app (Expo), usar o preset do React Native
  return {
    presets: ['module:@react-native/babel-preset'],
  };
};
