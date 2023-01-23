export function plural(count: number, label: string, printCount: boolean = true): string {
	return (printCount ? count + " " : "") + label + (count === 1 ? "" : "s");
}

export function randomInt(max: number): number {
	return Math.floor((max + 1) * Math.random());
}

export function randomWithin(min: number, max: number): number {
	return randomInt(max-min) + min;
}

export class Statistic {
	min: number;
	max: number;
	totalValue: number;
	totalEntries: number;
	
	constructor() {
		this.min = -1;
		this.max = -1;
		this.totalValue = 0;
		this.totalEntries = 0;
	}
	
	record(value: number): void {
		if(this.min < 0 || value < this.min)
			this.min = value;
		if(this.max < 0 || value > this.max)
			this.max = value;
		
		this.totalValue += value;
		this.totalEntries++;
	}
	
	getAverage(): number {
		return Math.round(this.totalValue / this.totalEntries);
	}
	
	printValues(header?: string): void {
		if(header) console.log(header);
		console.log(`Value range: ${this.min} - ${this.max}`);
		console.log(`Average across ${plural(this.totalEntries, "value")}: ${this.getAverage()}`);
	}
}
