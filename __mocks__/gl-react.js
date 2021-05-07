const gl_react = jest.genMockFromModule('gl-react');
const mocks = require('./GLReact.mocks');
gl_react.Shaders.create = mocks.shaders_create;
module.exports = gl_react;