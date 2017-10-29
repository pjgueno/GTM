L.HexbinLayer = L.Layer.extend({
	_undef (a) { return typeof a === 'undefined' },
	options: {
		radius: 15,
		opacity: 0.6,
        
//        REGARDER LA DURATION DE LA TRANSISTION ICI
        
		duration: 0,
		onmouseover: undefined,
		onmouseout: undefined,
        click: undefined,
        valueDomain:[],        
        colorRange: [],


		lng: function (d) {return d.coo[1]},
		lat: function (d) {return d.coo[0]},
		value: function (d) {
                        
            if(selector == 'cas'){
                
//                console.log(d3.sum(d, (o) => o.o.k))
                return d3.sum(d, (o) => o.o.k)   
            }else{return d.length}
        }
    },

	initialize (options) {
		L.setOptions(this, options)
		this._data = []
		this._colorScale = d3.scaleLinear()
			.domain(this.options.valueDomain)
			.range(this.options.colorRange)
			.clamp(true)
	},

	onAdd (map) {
		this.map = map
		let _layer = this

		// SVG element
		this._svg = L.svg()
		map.addLayer(this._svg)
		this._rootGroup = d3.select(this._svg._rootGroup).classed('d3-overlay', true)
		this.selection = this._rootGroup
    
		// Init shift/scale invariance helper values
		this._pixelOrigin = map.getPixelOrigin()
		this._wgsOrigin = L.latLng([0, 0])
		this._wgsInitialShift = this.map.latLngToLayerPoint(this._wgsOrigin)
		this._zoom = this.map.getZoom()
		this._shift = L.point(0, 0)
		this._scale = 1

		// Create projection object
		this.projection = {
			latLngToLayerPoint: function (latLng, zoom) {
				zoom = _layer._undef(zoom) ? _layer._zoom : zoom
				let projectedPoint = _layer.map.project(L.latLng(latLng), zoom)._round()
				return projectedPoint._subtract(_layer._pixelOrigin)
			},
			layerPointToLatLng: function (point, zoom) {
				zoom = _layer._undef(zoom) ? _layer._zoom : zoom
				let projectedPoint = L.point(point).add(_layer._pixelOrigin)
				return _layer.map.unproject(projectedPoint, zoom)
			},
			unitsPerMeter: 256 * Math.pow(2, _layer._zoom) / 40075017,
			map: _layer.map,
			layer: _layer,
			scale: 1
		}
		this.projection._projectPoint = function (x, y) {
			let point = _layer.projection.latLngToLayerPoint(new L.LatLng(y, x))
			this.stream.point(point.x, point.y)
		}

		this.projection.pathFromGeojson = d3.geoPath().projection(d3.geoTransform({point: this.projection._projectPoint}))

		// Compatibility with v.1
		this.projection.latLngToLayerFloatPoint = this.projection.latLngToLayerPoint
		this.projection.getZoom = this.map.getZoom.bind(this.map)
		this.projection.getBounds = this.map.getBounds.bind(this.map)
		this.selection = this._rootGroup // ???

		// Initial draw
		this.draw()
	},

	onRemove (map) {
		if (this._container != null)
			this._container.remove()

		// Remove events
		map.off({'moveend': this._redraw}, this)

		this._container = null
		this._map = null

		// Explicitly will leave the data array alone in case the layer will be shown again
		// this._data = [];
	},

	addTo (map) {
		map.addLayer(this)
		return this
	},

	_disableLeafletRounding () {
		this._leaflet_round = L.Point.prototype._round
		L.Point.prototype._round = function () { return this }
	},

	_enableLeafletRounding () {
		L.Point.prototype._round = this._leaflet_round
	},

	draw () {
		this._disableLeafletRounding()
		this._redraw(this.selection, this.projection, this.map.getZoom())
		this._enableLeafletRounding()
	},
	getEvents: function () { return {zoomend: this._zoomChange} },
    
    
	_zoomChange: function () {    
		let mapZoom = map.getZoom()
        let MapCenter = map.getCenter()
		this._disableLeafletRounding()
		let newZoom = this._undef(mapZoom) ? this.map._zoom : mapZoom        
		this._zoomDiff = newZoom - this._zoom
		this._scale = Math.pow(2, this._zoomDiff)
		this.projection.scale = this._scale
		this._shift = this.map.latLngToLayerPoint(this._wgsOrigin)
				._subtract(this._wgsInitialShift.multiplyBy(this._scale))
		let shift = ["translate(", this._shift.x, ",", this._shift.y, ") "]    
		let scale = ["scale(", this._scale, ",", this._scale,") "]
		this._rootGroup.attr("transform", shift.concat(scale).join(""))
		this.draw()
		this._enableLeafletRounding()     
	},
	_redraw(selection, projection, zoom){
        
        
        
        
		// Generate the mapped version of the data
		let data = this._data.map( (d) => {
			let lng = this.options.lng(d)
			let lat = this.options.lat(d)
			let point = projection.latLngToLayerPoint([lat, lng])            
			return { o: d, point: point }
		});
        
//        console.log(data)
        
        data.sort((a,b)=> new Date(a.o.d) - new Date(b.o.d))
        
		// Select the hex group for the current zoom level. This has
		// the effect of recreating the group if the zoom level has changed
		let join = selection.selectAll('g.hexbin')
			.data([zoom], (d) => d)
    
		// enter
		join.enter().append('g')
			.attr('class', (d) => 'hexbin zoom-' + d)

		// exit
		join.exit().remove()
        
        d3.selectAll('path.hexbin-hexagon').remove()

		// add the hexagons to the select
		this._createHexagons(join, data, projection)
        
	},

	_createHexagons(g, data, projection) {
		// Create the bins using the hexbin layout
        
		let hexbin = d3.hexbin()
			.radius(this.options.radius / projection.scale)
			.x( (d) => d.point.x )
			.y( (d) => d.point.y )
        
        
        
		let bins = hexbin(data)
        this.options.valueDomain = getDomain(bins) 
        
        
        
        
        
        
        
        
        this.options.colorRange = getRange() 

        
        this.initialize(this.options)
//        console.log(this.options.valueDomain)

		// Join - Join the Hexagons to the data
		let join = g.selectAll('path.hexbin-hexagon')
			.data(bins)
        
//        var zoomLevel = map.getZoom()
//        var maxRange = parseInt(100*(1/zoomLevel))
//        
//        console.log(maxRange)
//        
//        var radius = d3.scaleSqrt()
//    .domain([0, radiusDomain(bins)])
//    .range([1, maxRange]);

		// Update - set the fill and opacity on a transition (opacity is re-applied in case the enter transition was cancelled)
		join.transition().duration(this.options.duration)
			.attr('fill', (d) => this._colorScale(this.options.value(d)))
			.attr('fill-opacity', this.options.opacity)
			.attr('stroke-opacity', this.options.opacity)

        
        
//        console.log(this.options.radius)
        
        
        
		// Enter - establish the path, the fill, and the initial opacity
		join.enter().append('path').attr('class', 'hexbin-hexagon')
        
//        SI BESOIN ENLEVER RADIUS
            .attr('d', (d) => 'M' + d.x + ',' + d.y + hexbin.hexagon())
//			.attr('d', (d) => 'M' + d.x + ',' + d.y + hexbin.hexagon(radius(d.length)))
			.attr('fill', (d) => this._colorScale(this.options.value(d)))
			.attr('fill-opacity', 0.01)
			.attr('stroke-opacity', 0.01)
			.on('mouseover', this.options.mouseover)
			.on('mouseout', this.options.mouseout)
			.on('click', this.options.click)
			.transition().duration(this.options.duration)
				.attr('fill-opacity', this.options.opacity)
				.attr('stroke-opacity', this.options.opacity)

		// Exit
		join.exit().transition().duration(this.options.duration)
			.attr('fill-opacity', 0.01)
			.attr('stroke-opacity', 0.01)
			.remove()
	},
	data (data) {
		this._data = (data != null) ? data : []
		this.draw()
		return this
	}
});

L.hexbinLayer = function(options) {
	return new L.HexbinLayer(options);
};




function getRange(){
    
 if(selector == 'cas' || selector == 'all'){return ['transparent','blue','cyan','lime','yellow','red']
            }else{
                
                
                
             switch (selector){
        
                case 'ass':
                return ['transparent','#FE0000'];
                break;
                
                case 'aa':
                return ['transparent','#1A08DD'];
                break;
                
                case 'bomb':
                return ['transparent','#44FE61'];
                break;
                
                case 'hija':
                return ['transparent','#FAFE44'];
                break;
                
                case 'host1':
                return ['transparent','#FE44E7'];
                break;
                
                case 'host2':
                return ['transparent','#DA5501'];
                break;
                
                case 'atta':
                return ['transparent','#828282'];
                break;
                
                case 'ua':
                return ['transparent','#461900'];
                break;
                
                case 'unkn':
                return ['transparent','#7F68B0'];
                break;
        }}; 
    
};





function getDomain(val){
    
    var arraySum =[];
    var bbox = map.getBounds();
    var unit;

    val.forEach(function(itembin){
                itembin.forEach(function(item){
                        var position = L.latLng(item.o.coo[0],item.o.coo[1]);
                        if (bbox.contains(position)){
                            if(selector == 'cas'){arraySum.push(d3.sum(itembin, (o) => o.o.k)); unit =' killed';}
                            else{arraySum.push(itembin.length); unit =' attacks';};                
                                   };
                });
            });
        
         
            var max = Math.max(...arraySum);
    
    
//            var max = d3.max(arraySum);
    
    
    
    if(max != -Infinity){
    
    document.getElementById('limitmax').innerHTML= max;
    document.getElementById('limit4').innerHTML= parseInt((80*max)/100);
    document.getElementById('limit3').innerHTML= parseInt((60*max)/100);
    document.getElementById('limit2').innerHTML= parseInt((40*max)/100);
    document.getElementById('limit1').innerHTML= parseInt((20*max)/100);
    document.getElementById('limit0').innerHTML= 0 + unit ;
            }else{
                
                
               document.getElementById('limitmax').innerHTML= "";
    document.getElementById('limit4').innerHTML= "";
    document.getElementById('limit3').innerHTML= "";
    document.getElementById('limit2').innerHTML= "";
    document.getElementById('limit1').innerHTML= "";
    document.getElementById('limit0').innerHTML= ""; 
                
                
                
                
            };
           
    if (selector == 'cas' || selector == 'all'){
            return [0,parseInt((20*max)/100),parseInt((40*max)/100),parseInt((60*max)/100),parseInt((80*max)/100), max]
            }else{return [0,max]};
             

};
    
function radiusDomain(val){
    
        var arrayRadius =[];
        var bbox = map.getBounds();

      val.forEach(function(itembin){
                itembin.forEach(function(item){
                        var position = L.latLng(item.o.coo[0],item.o.coo[1]);
                        if (bbox.contains(position)){
                                arrayRadius.push(itembin.length)};
                });
            });
    
    
                var max = Math.max(...arrayRadius);
    
    //            var max = d3.max(arrayRadius);


    return max;
    
};
 


//EVENTUELLEMENT

//NOMBRE ATTENTAT = TAILLE
//NOMBRE DE MORT = COULEUR


function filterRedraw(typ,val){
    
    clicktest = true;
    
    console.log(val);
    
    removeSvg();
    removeDiv();
    
    hmhexafiltered = hmhexa.filter(function(item){if(item[typ] == val){return item}});
    
    reload(hmhexafiltered);  
    
};
