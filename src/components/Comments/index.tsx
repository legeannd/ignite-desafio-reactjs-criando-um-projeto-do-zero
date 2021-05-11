import { Component } from 'react';

export default class Comments extends Component {
  componentDidMount() {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-utterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');
    script.setAttribute(
      'repo',
      'legeannd/ignite-desafio-reactjs-criando-um-projeto-do-zero'
    );
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'dark-blue');
    anchor.appendChild(script);
  }

  render() {
    return (
      <div
        id="inject-comments-for-utterances"
        style={{ marginBottom: '4rem' }}
      />
    );
  }
}
