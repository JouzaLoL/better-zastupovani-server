let supl = require('../lib/supl');
let expect = require('chai').expect;

describe('Supl library - Unit', () => {
	it('Should get class list', (done) => {
		supl.getClasses()
			.then((classes) => {
				expect(classes).to.be.an.instanceof(Array);
				expect(classes[0]).to.equal('I.A8');
				done();
			}).catch((err) => {
				done(err);
			});
	});

	it('Should get current dates list', (done) => {
		supl.getDatesPage()
			.then((datesPage) => {
				const dates = supl.parseDatesPage(datesPage);
				expect(dates).to.be.an.instanceof(Array);
				expect(typeof dates[0].url).to.equal('string');
				expect(dates[0].date.isValid()).to.be.true;
				done();
			}).catch((err) => {
				done(err);
			});
	});

	it('Should get data (chybejici, suplovani, nahradni ucebny) and parse it succesfully', (done) => {
		
		supl
			.getDatesPage().then((datesPage) => {
				const dates = supl.parseDatesPage(datesPage);
				let date = dates[0];
				supl.getSuplovani(date).then((suplovani) => {
					let parsed = supl.parseSuplovani(suplovani);
					expect(parsed).to.have.keys(['chybejici', 'suplovani', 'nahradniUcebny']);
					expect(parsed.chybejici).to.be.an.instanceof(Array);
					expect(parsed.suplovani).to.be.an.instanceof(Array);
					expect(parsed.nahradniUcebny).to.be.an.instanceof(Array);
					done();
				}).catch((err) => {
					done(err);
				});
			}, done);

	});
});