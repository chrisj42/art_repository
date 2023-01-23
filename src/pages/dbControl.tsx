import * as db from "../backend/db";
import React from "react";

export class DBPanel extends React.Component<{}, {msg: string, processing: boolean, finished: boolean}> {
	constructor(props: {}) {
		super(props);
		this.state = {msg: "Choose an action.", processing: false, finished: false};
	}
	
	componentDidMount() {
		// auto-button press for now.
		// this.run();
	}
	
	render() {
		// console.log("rendering with:");
		// console.log(this.state);
		return (
			<div>
				{!this.state.processing && <ButtonSet dbInterface={this}/>}
				{this.state.finished && <p>output of DB action:</p>}
				<p>{this.state.msg}</p>
			</div>
		);
	}
	
	run(dbFunc: () => Promise<string>) {
		this.setState({msg: "Executing...", processing: true, finished: false});
		dbFunc()
			.then(res => res, err => "error: "+err.message)
			.then(msg => this.setState({msg: msg, processing: false, finished: true}));
	}
}

function ButtonSet(props: {dbInterface: DBPanel}) {
	// props include a reference to the run() method above in DBInterface; it will actually run the function and display the result
	
	const functionList = Object.keys(db).map(funcName => (db as any)[funcName] as () => Promise<string>);
	const elements = functionList.map(func =>
		<button key={func.name} onClick={() => {
			props.dbInterface.run(func);
		}}>
			{separateCamelCase(func.name)}
		</button>
	);
	return <div>{elements}</div>;
}

function separateCamelCase(name: string): string {
	let words = name.match(/(?:^.|[A-Z])[a-z]*/g) as string[]; // this is always going to match at least something
	words[0] = words[0].substring(0, 1).toUpperCase() + words[0].substring(1);
	return words.join(" ");
}
