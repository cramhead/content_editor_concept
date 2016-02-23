import React, { Component, PropTypes } from 'react';
import { baseStyles, basePropTypes, baseStateVariables } from './base-plugin';

const style = Object.assign({}, baseStyles, { margin: '0em 1em 1em 0em' });
const pluginProptypes = Object.assign({
  width: PropTypes.string,
  height: PropTypes.string
}, basePropTypes);

export default class ImagePlugin extends Component {
  static propTypes = pluginProptypes;

  constructor(props) {
    super(props);
    this.clickHandler = this.clickHandler.bind(this);
    this.dragEnter = this.dragEnter.bind(this);
    this.dragLeave = this.dragLeave.bind(this);
    this.drop = this.drop.bind(this);
    this.handleImageExtraction = this.handleImageExtraction.bind(this);

    const imageURL = 'http://i.imgur.com/wXpNi4T.gif';

    this.state = Object.assign({ imageURL, isDragging: false }, baseStateVariables);
  }

  setImageFile(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = ({ target: { result } }) => {
      this.setState({ imageURL: result, editMode: false, pluginData: file, isDragging: false });
    };
  }

  handleImageExtraction(event) {
    const { target } = event;
    event.preventDefault();
    event.stopPropagation();

    const inputs = target.parentElement.querySelectorAll('input');
    let element = null;

    inputs.forEach((input) => {
      if (input.value !== '' && input.value !== null) {
        element = input;
        return;
      }
    });

    if (element.type === 'file') {
      const file = element.files[0];

      if (!file.name.match(/.jpg|.png|.gif/)) return;

      this.setImageFile(file);
    } else {
      if (!element.value.match(/.jpg|.png|.gif/)) return;

      const imageURL = element.value;
      this.setState({ imageURL, editMode: false });
    }
  }

  dragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  dragEnter(event) {
    event.preventDefault();
    this.setState({ isDragging: true });
  }

  dragLeave(event) {
    event.preventDefault();
    this.setState({ isDragging: false });
  }

  drop(event) {
    event.preventDefault();
    event.stopPropagation();
    const { dataTransfer: { files } } = event;

    // only 1 file for now
    const file = files[0];
    this.setImageFile(file);
  }

  clickHandler({ target: { tagName } }) {
    if (tagName.toLowerCase().match(/button|input/) !== null) return;

    this.setState({ editMode: true });
  }

  bindDragAndDropEvents() {
    return {
      onDragEnter: this.dragEnter,
      onDragOver: this.dragOver,
      onDragLeave: this.dragLeave,
      onDrop: this.drop
    };
  }

  buildContent(isPreviewing) {
    const { imageURL } = this.state;
    const imageStyle = { display: 'block', width: this.props.width };
    const imageElement = <img src={imageURL} style={ imageStyle } />;

    const events = this.bindDragAndDropEvents();

    const overlayEvents = Object.assign({}, events, {
      onDragEnter: (event) => {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    const { padding } = style;
    const defaultStyle = { padding, position: 'relative' };
    const dragOverlayStyle = {
      position: 'absolute',
      display: ((this.state.isDragging) ? 'flex' : 'none'),
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      background: 'rgba(228, 228, 228, 0.82)',
      color: '#636363',
      alignItems: 'center',
      justifyContent: 'center'
    };

    const dragOverlay = <div style={dragOverlayStyle} {...overlayEvents}>Drop here...</div>;

    let defaultContent = (
      <div onClick={this.clickHandler} onDragEnter={events.onDragEnter} style={defaultStyle}>
        Here will be an image like bellow
        { imageElement }
        { dragOverlay }
      </div>
    );

    if (this.state.editMode) {
      const editorStyle = {
        display: 'flex',
        flexDirection: 'column',
        padding
      };

      defaultContent = (
        <div style={ editorStyle } className="image-editor-wrapper">
          <input type="text" placeholder="http://image.url" />
          <br />
          <span>or</span>
          <br />
          <input type="file" />
          <br />
          <button onClick={this.handleImageExtraction}>Done</button>
        </div>
      );
    }

    if (isPreviewing) {
      defaultContent = imageElement;
    }

    return defaultContent;
  }

  render() {
    const {
      className = '',
      getData,
      pluginIndex,
      isPreviewing
    } = this.props;
    const { pluginData, isDragging } = this.state;
    const classNames = `image-plugin ${className}`;
    const markdown = `![](${this.state.imageURL})`;

    let border = style.border;

    if (isPreviewing) {
      border = 'none';
    }
    if (isDragging) {
      border = '2px dashed #A0E2C4';
    }

    const pluginStyle = Object.assign({}, style, { border, padding: 'none' });

    getData({ markdown, pluginIndex, pluginData });

    return (
      <div style={pluginStyle} className={classNames}>
        {this.buildContent(isPreviewing)}
      </div>
    );
  }
}
