import React, { Component, PropTypes } from 'react';
import { baseStyles, basePropTypes, baseStateVariables } from './base-plugin';
import { autobind } from 'core-decorators';

const style = Object.assign({}, baseStyles, { padding: '0 1em' });
const pluginProptypes = Object.assign({
  headingLevel: PropTypes.string,
  placeholderText: PropTypes.string
}, basePropTypes);

export default class TextPlugin extends Component {
  static propTypes = pluginProptypes;

  constructor(props) {
    super(props);

    const { placeholderText: text = 'Here will be some heading text' } = this.props;
    const headingLevel = this.props.headingLevel.match(/\d$/)[0];
    const markdown = `${this.getMarkdownHeading(headingLevel)} ${text}`;

    this.state = Object.assign({ text, markdown }, baseStateVariables);
  }

  getMarkdownHeading(headingLevel) {
    let markdownHeading = '';

    for (let i = 0; i < headingLevel; i++) {
      markdownHeading += '#';
    }

    return markdownHeading;
  }

  @autobind
  clickEventHandler() {
    this.setState({ editMode: !this.state.editMode });
  }

  @autobind
  handleInput({ key, target: { value: text } }) {
    if (key === 'Enter') {
      const headingLevel = this.props.headingLevel.match(/\d$/)[0];
      const markdownHeading = this.getMarkdownHeading(headingLevel);

      this.setState({ editMode: false, text, markdown: `${markdownHeading} ${text}` });
    }
  }

  parseContent() {
    const props = { onClick: this.clickEventHandler };
    let parsedContent = React.createElement(this.props.headingLevel, props, this.state.text);

    if (this.state.editMode) {
      parsedContent = (
        <input type="text" placeholder={this.state.text} onKeyUp={this.handleInput} />
      );
    }

    return parsedContent;
  }

  shoudComponentUpdate(previousState, nextState) {
    return previousState.editMode !== nextState.editMode;
  }

  render() {
    const { className = '', pluginIndex, pluginId, isPreviewing } = this.props;
    const { markdown } = this.state;
    const classNames = `text-plugin ${className}`;
    const pluginStyle = Object.assign({}, style, {
      border: ((isPreviewing) ? 'none' : style.border)
    });

    this.props.getData({ markdown, pluginIndex, pluginId });

    return (<div className={ classNames } style={ pluginStyle }>
      {this.parseContent()}
    </div>);
  }
}
