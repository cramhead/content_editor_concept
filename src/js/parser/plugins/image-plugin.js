import PluginFactory from './plugin-factory';

const style = `
<style>
  .image-plugin {
    padding: 1em;
    border: dashed 2px #acacac;
  }
</style>`;

const markup = '<div class="image-plugin">Here will be some image</div>';

export default new PluginFactory({ name: 'image', markup, style });