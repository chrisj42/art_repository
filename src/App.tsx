import React from 'react';
import logo from './logo.svg';
import './App.css';
import {DBPanel} from "./pages/dbControl";

function App(props: {}) {
	return (
		<div className="App">
			<header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
			<p>
				Edit <code>src/App.tsx</code> and save to reload.
			</p>
			<a
				className="App-link"
				href="https://reactjs.org"
				target="_blank"
				rel="noopener noreferrer"
			>
				Learn React!
			</a>
			
			<DBPanel/>
			
			</header>
			<Comment author={{avatarUrl: "string", name: "wow"}} text={""} date={new Date()}/>
		</div>
	);
}

interface User {
	avatarUrl: string;
	name: string;
}

function Avatar(props: {user: User}) {
	return (
		<img className="Avatar"
			 src={props.user.avatarUrl}
			 alt={props.user.name}
		/>
	);
}

function UserInfo(props: {user: User}) {
	return (
		<div className="UserInfo">
			<Avatar user={props.user}/>
			<div className="UserInfo-name">
				{props.user.name}
			</div>
		</div>
	);
}

class Comment extends React.Component<{author: User, text: string, date: Date}, any> {
	// any seems to be able to be used here without repercussion, allowing the props type to be defined just fine without a separate interface and without being repeated.
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	
	render() {
		return (
			<div className="Comment">
				<UserInfo user={this.props.author}/>
				<div className="Comment-text">
					{this.props.text}
				</div>
				<div className="Comment-date">
					{formatDate(this.props.date)}
				</div>
			</div>
		);
	}
}

function formatDate(date: Date) {
	return date.toLocaleDateString();
}

export default App;
