define([
	'jquery',
	'underscore',
	'backbone',
	'site/map',
	'../collections/examples',
	'../collections/Topics',
	'../collections/Apis'
], function ( $, _, Backbone, siteMap, examples, Topics, Apis ){
	
	var ExamplesConfig = Backbone.Model.extend({
		defaults: {
			selectedTopic: '',
			selectedApi: '',
			examples: new examples.Examples(),
			topics: new Topics(),
			apis: new Apis(),
			filteredExamples: new examples.Examples()
		},
		initialize: function(){
			_.bindAll( this, 'applyFilters' );
			this.on('change:selectedTopic', this.applyFilters);
			this.on('change:selectedApi', this.applyFilters);
		},
		applyFilters: function(){
			console.log("BOOM");
			var topicExamples = new examples.Examples().reset(this.get('examples').clone().models);
			var apiExamples = new examples.Examples().reset(this.get('examples').clone().models);
			
			if( this.get('selectedTopic') !== "" ){
				topicExamples.reset(function(m){
					var match = m.get('topics').where({ tag: m.get('selectedTopic').toLowerCase() })[0];
					return ( match !== undefined ) ? match.get('examples').slice(0) : [];
				}( this ));
			}
			if( this.get('selectedApi') !== "" ){
				apiExamples.reset(function(m){
					var match = m.get('apis').where({ tag: m.get('selectedApi').toLowerCase() })[0];
					return (match !== undefined ) ? match.get('examples').slice(0) : [];
				}( this ));
			}
			//get the examples that are in both
			var matchingExamples = apiExamples.filter(function( example ){
				return topicExamples.indexOf( example ) > -1;
			});

			this.get('filteredExamples').reset( matchingExamples );
		},
		parse: function( res ){
			console.log('parse', res );
			this.get('examples').reset( res.examples );
			this.get('filteredExamples').reset( res.examples );
			this.get('topics').reset( res.topics );
			this.get('apis').reset( res.apis );

			this.get('topics').each(function( topic ){
				var matches = this.get('examples').filter(function( example ){
					return example.get('tags').indexOf( topic.get('tag').toLowerCase() ) > -1;
				});

				topic.set({ examples: matches });
			}, this);

			this.get('apis').each(function( api ){
				var matches = this.get('examples').filter( function( example ){
					return example.get('tags').indexOf( api.get('tag').toLowerCase() ) > -1;
				});
				api.set({ examples: matches });
			}, this);
			this.trigger('change');
		},
		toJSON: function(){
			return {
				selectedTopic: this.get('selectedTopic'),
				selectedApi: this.get('selectedApi'),
				topics: this.get('topics').toJSON(),
				apis: this.get('apis').toJSON(),
				examples: this.get('examples').toJSON()
			};
		}
	});

	var model = new ExamplesConfig();
	model.parse( siteMap );
	window.map = siteMap;
	model.ExamplesConfig = ExamplesConfig;
	return model;
});
    