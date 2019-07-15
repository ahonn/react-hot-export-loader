import React, { Component } from 'react';

class Counter extends Component {
  state = {
    count: 0,
  };

  render() {
    const { count } = this.state;
    const setCount = (newCount) => this.setState({ count: newCount });

    return (
      <div>
        <p>count: {count}</p>
        <button onClick={() => setCount(count + 1)}>+</button>
        <button onClick={() => setCount(count - 1)}>-</button>
      </div>
    );
  }
}

export default Counter;
