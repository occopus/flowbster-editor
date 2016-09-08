Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

$(document).ready(function() {

  var selectedCell;
  var selectedPort;
  var selectedPortType;

  var graph = new joint.dia.Graph;

  var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: 800,
    height: 600,
    gridSize: 5,
    model: graph,
    //snapLinks: true,
    //embeddingMode: false,
    interactive: true,
    defaultLink: new joint.dia.Link({
      attrs: {
        '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' }
      }
    }),
    validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
      if (magnetS && magnetS.getAttribute('type') === 'input')
       return false;
     if (cellViewS === cellViewT)
        return false;
      return magnetT && magnetT.getAttribute('type') === 'input';
    }
  });

  var highlighter = V('circle', {
    'r': 14,
    'stroke': '#ff7e5d',
    'stroke-width': '6px',
    'fill': 'transparent',
    'pointer-events': 'none'
  });

  var jobpropdialog = $('#jobpropdialog').dialog({
    autoOpen: false,
    width: 400,
    modal: true,
    resizable: false,
    x: 0,
    y: 0,
    cell: null,
    buttons: {
      'Set job properties': function() {
        var name = $('#jobname').val();
        var exename = $('#exename').val();
        var args = $('#args').val();
        var exetgz = $('#executabletgz').val();
        var scalingmin = parseInt($('#scalingmin').val(), 10);
        var scalingmax = parseInt($('#scalingmax').val(), 10);
        if (jobpropdialog.cell == null) {
          if (name == null)
            return;
          var elements = graph.getElements();
          for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            if (el.attr('.label/text') == name) {
              alert('The name \'' + name + '\' already exists. Please specify an other name');
              return;
            }
          }
          var rect = new joint.shapes.devs.Model({
            position: { x: jobpropdialog.x, y: jobpropdialog.y },
            size: {width: 100, height: 100},
            inPorts: [],
            inPortsProps: {},
            outPorts: [],
            outPortsProps: {},
            attrs: {
              '.label': { text: name },
              '.exename' : { text: exename },
              '.args' : { text: args },
              '.exetgz' : { text: exetgz },
              '.scaling' : { min: scalingmin, max: scalingmax },
              rect: {fill: 'green' },
              '.inPorts circle': { fill: '#16A085', magnet: 'passive', type: 'input' },
              '.outPorts circle': { fill: '#E74C3C', type: 'output' }
            }
          });
          graph.addCell(rect);
        } else {
          selectedCell.model.attr('.label/text', name);
          selectedCell.model.attr('.exename/text', exename);
          selectedCell.model.attr('.args/text', args);
          selectedCell.model.attr('.exetgz/text', exetgz);
          selectedCell.model.attr('.scaling/min', scalingmin);
          selectedCell.model.attr('.scaling/max', scalingmax);
        }
        jobpropdialog.dialog('close');
      },
      Cancel: function() {
        jobpropdialog.dialog('close');
      }
    },
  });

  var inportpropdialog = $('#inportpropdialog').dialog({
    autoOpen: false,
    width: 350,
    modal: true,
    buttons: {
      'Update port properties': function() {
        var oldName = selectedPort;
        var input_coll = $('#input_coll').is(':checked');
        var coll_filter = $('#coll_filter').val();
        var inPortsProps = selectedCell.model.get('inPortsProps');
        var portprops = {
          'input_coll': input_coll,
          'coll_filter': coll_filter
        };
        var newName = $('#inportname').val();
        if (oldName != newName) {
          console.log('About to rename port ' + oldName + ' to ' + newName);
          var portType = (selectedPortType == 'input' ? 'inPorts' : 'outPorts');
          var ports = selectedCell.model.get(portType);
          var foundPortIdx = -1;
          for (var i = 0; i < ports.length; i++) {
            if (ports[i] == newName) {
              alert('The port name set already exists!');
              return;
            }
            if (ports[i] == oldName)
              foundPortIdx = i;
          }
          inPortsProps[oldName] = undefined;
          if (foundPortIdx != -1)
            ports[foundPortIdx] = newName;
          selectedCell.model.set(portType, ports);
          selectedCell.model.trigger('change:' + portType);
          graph.trigger('change');
        }
        inPortsProps[newName] = portprops;
        selectedCell.model.set('inPortsProps', inPortsProps);
        inportpropdialog.dialog('close');
      },
      Cancel: function() {
        inportpropdialog.dialog('close');
      }
    },
  });

  var outportpropdialog = $('#outportpropdialog').dialog({
    autoOpen: false,
    width: 350,
    modal: true,
    buttons: {
      'Update port properties': function() {
        var oldName = selectedPort;
        var output_gen = $('#output_gen').is(':checked');
        var generator_regexp = $('#generator_regexp').val();
        var targetip = $('#targetip').val();
        var targetport = $('#targetport').val();
        var distribution = $('#distribution').val();
        var outPortsProps = selectedCell.model.get('outPortsProps');
        var portprops = {
          'output_gen': output_gen,
          'generator_regexp': generator_regexp,
          'targetip': targetip,
          'targetport': targetport,
          'distribution': distribution
        };
        var newName = $('#outportname').val();
        if (oldName != newName) {
          console.log('About to rename port ' + oldName + ' to ' + newName);
          var portType = 'outPorts';
          var ports = selectedCell.model.get(portType);
          var foundPortIdx = -1;
          for (var i = 0; i < ports.length; i++) {
            if (ports[i] == newName) {
              alert('The port name set already exists!');
              return;
            }
            if (ports[i] == oldName)
              foundPortIdx = i;
          }
          outPortsProps[oldName] = undefined;
          if (foundPortIdx != -1)
            ports[foundPortIdx] = newName;
          selectedCell.model.set(portType, ports);
          selectedCell.model.trigger('change:' + portType);
          graph.trigger('change');
        }
        outPortsProps[newName] = portprops;
        selectedCell.model.set('outPortsProps', outPortsProps);
        outportpropdialog.dialog('close');
      },
      Cancel: function() {
        outportpropdialog.dialog('close');
      }
    },
  });

  var workflowpropdialog = $('#workflowpropdialog').dialog({
    autoOpen: false,
    width: 350,
    modal: true,
    buttons: {
      'Update workflow properties': function() {
        workflowpropdialog.dialog('close');
      },
      Cancel: function() {
        workflowpropdialog.dialog('close');
      }
    },
  });

  $('#jobname').on('input change', function() {
    updateJobPropButton();
  });

  function updateJobPropButton() {
    var nameCandidate = $('#jobname').val();
    var valid = true;
    if (nameCandidate == '')
      valid = false;
    else if (jobNameExists(nameCandidate) && getSelectedJobsName() != nameCandidate)
      valid = false;
    if (valid)
      $(".ui-dialog-buttonpane button:contains('Set job properties')").button("enable");
    else
      $(".ui-dialog-buttonpane button:contains('Set job properties')").button("disable");
  }

  function jobNameExists(name) {
    var elements = graph.getElements();
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.attr('.label/text') == name) {
        return true;
      }
    }
    return false;
  }

  function getSelectedJobsProperty(name) {
    if (!selectedCell)
      return '';
    return selectedCell.model.attr('.' + name + '/text');
  }

  function getSelectedJobsName() {
    return getSelectedJobsProperty('label');
  }

  function getSelectedJobsExeName() {
    return getSelectedJobsProperty('exename');
  }

  function getSelectedJobsArgs() {
    return getSelectedJobsProperty('args');
  }

  function getSelectedJobsExeTGZ() {
    return getSelectedJobsProperty('exetgz');
  }

  function getSelectedJobsScalingMin() {
    if (!selectedCell)
      return '';
    return selectedCell.model.attr('.scaling/min');
  }

  function getSelectedJobsScalingMax() {
    if (!selectedCell)
      return '';
    return selectedCell.model.attr('.scaling/max');
  }

  paper.off('cell:highlight cell:unhighlight').on({
    'cell:highlight': function(cellView, el, opt) {
      if (opt.embedding) {
        V(el).addClass('highlighted-parent');
      }
      if (opt.connecting) {
        var bbox = V(el).bbox(false, paper.viewport);
        highlighter.translate(bbox.x + 10, bbox.y + 10, { absolute: true });
        V(paper.viewport).append(highlighter);
      }
    },
    'cell:unhighlight': function(cellView, el, opt) {
      if (opt.embedding) {
        V(el).removeClass('highlighted-parent');
      }
      if (opt.connecting) {
        highlighter.remove();
      }
    }
  });

  paper.on('all', function(eventName, cell) {
    console.log(arguments);
  });

  var selectCell = function(cell) {
    if (selectedCell != null) {
      selectedCell.model.attr('rect/stroke', 'black');
      selectedCell.model.attr('rect/stroke-width', '1px');
    }
    selectedCell = cell;
    selectedCell.model.attr('rect/stroke', 'red');
    selectedCell.model.attr('rect/stroke-width', '5px');
  }

  paper.on('cell:pointerclick', function(cell, eventName, x, y) {
    selectCell(cell);
    var portName = eventName.target.getAttribute('port');
    if (portName != null) {
      console.log(graph.getLinks());
      selectedPort = portName;
      selectedPortType = eventName.target.getAttribute('type');
      var jobname = cell.model.attr('.label/text');
      console.log('About to define data for ' + selectedPortType + ' port \'' + portName + '\' for job ' + jobname);
      if ("input" == selectedPortType) {
        $('#inportname').val(portName);
        var input_coll = false;
        var coll_filter = '';
        if (undefined != cell.model.get('inPortsProps')[portName]) {
          input_coll = cell.model.get('inPortsProps')[portName]['input_coll'];
          coll_filter = cell.model.get('inPortsProps')[portName]['coll_filter'];
        }
        $('#input_coll').prop('checked', input_coll);
        $('#coll_filter').val(coll_filter);
        $('#coll_filter').prop('disabled', !input_coll);
        inportpropdialog.dialog('open');
      } else {
        $('#outportname').val(portName);
        var targetip = '';
        var targetport = '';
        var output_gen = false;
        var generator_regexp = '';
        var distribution = 'random';
        if (undefined != cell.model.get('outPortsProps')[portName]) {
          targetip = cell.model.get('outPortsProps')[portName]['targetip'];
          targetport = cell.model.get('outPortsProps')[portName]['targetport'];
          output_gen = cell.model.get('outPortsProps')[portName]['output_gen'];
          generator_regexp = cell.model.get('outPortsProps')[portName]['generator_regexp'];
          distribution = cell.model.get('outPortsProps')[portName]['distribution'];
        };
        $('#output_gen').prop('checked', output_gen);
        $('#targetip').val(targetip);
        $('#targetport').val(targetport);
        $('#generator_regexp').val(generator_regexp);
        $('#distribution').val(distribution);
        $('#generator_regexp').prop('disabled', !output_gen);
        $('#distribution').prop('disabled', !output_gen);
        outportpropdialog.dialog('open');
      }
      return;
    }
  });

  paper.on('cell:pointerdblclick', function(cell, eventName, x, y) {
    selectCell(cell);
    jobpropdialog.cell = cell;
    $('#jobname').val(getSelectedJobsName());
    $('#exename').val(getSelectedJobsExeName());
    $('#args').val(getSelectedJobsArgs());
    $('#executabletgz').val(getSelectedJobsExeTGZ());
    $('#scalingmin').val(getSelectedJobsScalingMin());
    $('#scalingmax').val(getSelectedJobsScalingMax());
    updateJobPropButton();
    jobpropdialog.dialog('open');
  });

  paper.on('blank:pointerclick', function(eventName, x, y) {
    addJob(x, y);
  });

  $("#deljobbutton").click(function() {
    selectedCell.model.remove();
    selectedCell = null;
  });

  $("#addinportbutton").click(function() {
    addPort('inPorts');
  });

  $("#addoutportbutton").click(function() {
    addPort('outPorts');
  });

  $("#delportbutton").click(function() {
    var type = (selectedPortType == 'output' ? 'outPorts' : 'inPorts');
    var ports = selectedCell.model.get(type);
    ports.remove(selectedPort);
    selectedCell.model.set(type, ports);
    selectedCell.model.trigger('change:' + type);
  });

  $("#wfpropbutton").click(function() {
    workflowpropdialog.dialog('open');
  });

  $("#dumpgraphbutton").click(function() {
    console.log('Graph\'s JSON is:\n' + JSON.stringify(graph.toJSON(), null, '\t'));
  });

  $('#loadgraphbutton').click(function() {
    //graph.fromJSON(JSON.parse('{	"cells": [		{			"type": "devs.Model",			"size": {				"width": 100,				"height": 100			},			"inPorts": [				"inPorts0",				"foobar"			],			"outPorts": [				"outPorts0"			],			"position": {				"x": 130,				"y": 125			},			"angle": 0,			"inPortsProps": {				"inPorts0": {					"input_coll": false,					"coll_filter": "1"				},				"foobar": {					"input_coll": true,					"coll_filter": "2"				}			},			"outPortsProps": {				"outPorts0": {					"output_gen": true,					"generator_regexp": "dwwdw",					"targetip": "http://foo.bar",					"targetport": "111",					"distribution": "round"				}			},			"id": "99a6fd95-ed71-40f7-bbaa-780653997280",			"z": 1,			"attrs": {				".label": {					"text": "1"				},				".exename": {					"text": ""				},				".args": {					"text": ""				},				".exetgz": {					"text": ""				},				".scaling": {					"min": null,					"max": null				},				"rect": {					"fill": "green",					"stroke": "red",					"stroke-width": "5px"				},				".inPorts circle": {					"fill": "#16A085",					"magnet": "passive",					"type": "input"				},				".outPorts circle": {					"fill": "#E74C3C",					"type": "output"				},				".inPorts>.port0>.port-label": {					"text": "inPorts0"				},				".inPorts>.port0>.port-body": {					"port": {						"id": "inPorts0",						"type": "in"					}				},				".inPorts>.port0": {					"ref": ".body",					"ref-y": 0.25				},				".inPorts>.port1>.port-label": {					"text": "foobar"				},				".inPorts>.port1>.port-body": {					"port": {						"id": "foobar",						"type": "in"					}				},				".inPorts>.port1": {					"ref": ".body",					"ref-y": 0.75				},				".outPorts>.port0>.port-label": {					"text": "outPorts0"				},				".outPorts>.port0>.port-body": {					"port": {						"id": "outPorts0",						"type": "out"					}				},				".outPorts>.port0": {					"ref": ".body",					"ref-y": 0.5,					"ref-dx": 0				}			}		},		{			"type": "devs.Model",			"size": {				"width": 100,				"height": 100			},			"inPorts": [				"inPorts1"			],			"outPorts": [				"outPorts0"			],			"position": {				"x": 440,				"y": 125			},			"angle": 0,			"inPortsProps": {				"inPorts1": {					"input_coll": false,					"coll_filter": ""				}			},			"outPortsProps": {},			"id": "b465a539-7b2b-4bd3-9274-ff705250563f",			"z": 2,			"attrs": {				".label": {					"text": "2"				},				".exename": {					"text": ""				},				".args": {					"text": ""				},				".exetgz": {					"text": ""				},				".scaling": {					"min": null,					"max": null				},				"rect": {					"fill": "green",					"stroke": "black",					"stroke-width": "1px"				},				".inPorts circle": {					"fill": "#16A085",					"magnet": "passive",					"type": "input"				},				".outPorts circle": {					"fill": "#E74C3C",					"type": "output"				},				".inPorts>.port0>.port-label": {					"text": "inPorts1"				},				".inPorts>.port0>.port-body": {					"port": {						"id": "inPorts1",						"type": "in"					}				},				".inPorts>.port0": {					"ref": ".body",					"ref-y": 0.5				},				".outPorts>.port0>.port-label": {					"text": "outPorts0"				},				".outPorts>.port0>.port-body": {					"port": {						"id": "outPorts0",						"type": "out"					}				},				".outPorts>.port0": {					"ref": ".body",					"ref-y": 0.5,					"ref-dx": 0				}			}		},		{			"type": "link",			"source": {				"id": "99a6fd95-ed71-40f7-bbaa-780653997280",				"selector": "g:nth-child(1) > g:nth-child(4) > g:nth-child(1) > circle:nth-child(1)",				"port": "outPorts0"			},			"target": {				"id": "b465a539-7b2b-4bd3-9274-ff705250563f",				"port": "inPorts1",				"selector": "g:nth-child(1) > g:nth-child(3) > g:nth-child(1) > circle:nth-child(1)"			},			"id": "9a30123e-2236-434f-925f-95d146bfd0c9",			"embeds": "",			"z": 3,			"vertices": [],			"attrs": {				".marker-target": {					"d": "M 10 0 L 0 5 L 10 10 z"				},				"rect": {					"stroke": "black",					"stroke-width": "1px"				}			}		}	]}'));
    graph.fromJSON(JSON.parse('{"cells":[{"type":"devs.Model","size":{"width":100,"height":100},"inPorts":["input-ligands.zip","vina-config.txt","input-receptor.pdbqt"],"outPorts":["output.zip","config.txt","receptor.pdbqt"],"position":{"x":100,"y":80},"angle":0,"inPortsProps":{"input-ligands.zip":{"input_coll":false,"coll_filter":""},"vina-config.txt":{"input_coll":false,"coll_filter":""},"input-receptor.pdbqt":{"input_coll":false,"coll_filter":""}},"outPortsProps":{"output.zip":{"output_gen":true,"generator_regexp":"output.zip*","targetip":"","targetport":"","distribution":"random"},"config.txt":{"output_gen":false,"generator_regexp":"","targetip":"","targetport":"","distribution":null},"receptor.pdbqt":{"output_gen":false,"generator_regexp":"","targetip":"","targetport":"","distribution":null}},"id":"7103b0d9-3306-4311-bcf0-248835ac3f67","z":1,"attrs":{".label":{"text":"Generator"},".exename":{"text":"execute.bin"},".args":{"text":"20"},".exetgz":{"text":"https://www.dropbox.com/s/2l3pkmxfb8k6wsc/generator_exe.tgz?dl=1"},".scaling":{"min":1,"max":1},"rect":{"fill":"green","stroke":"black","stroke-width":"1px"},".inPorts circle":{"fill":"#16A085","magnet":"passive","type":"input"},".outPorts circle":{"fill":"#E74C3C","type":"output"},".inPorts>.port0>.port-label":{"text":"input-ligands.zip"},".inPorts>.port0>.port-body":{"port":{"id":"input-ligands.zip","type":"in"}},".inPorts>.port0":{"ref":".body","ref-y":0.16666666666666666},".inPorts>.port1>.port-label":{"text":"vina-config.txt"},".inPorts>.port1>.port-body":{"port":{"id":"vina-config.txt","type":"in"}},".inPorts>.port1":{"ref":".body","ref-y":0.5},".inPorts>.port2>.port-label":{"text":"input-receptor.pdbqt"},".inPorts>.port2>.port-body":{"port":{"id":"input-receptor.pdbqt","type":"in"}},".inPorts>.port2":{"ref":".body","ref-y":0.8333333333333333},".outPorts>.port0>.port-label":{"text":"output.zip"},".outPorts>.port0>.port-body":{"port":{"id":"output.zip","type":"out"}},".outPorts>.port0":{"ref":".body","ref-y":0.16666666666666666,"ref-dx":0},".outPorts>.port1>.port-label":{"text":"config.txt"},".outPorts>.port1>.port-body":{"port":{"id":"config.txt","type":"out"}},".outPorts>.port1":{"ref":".body","ref-y":0.5,"ref-dx":0},".outPorts>.port2>.port-label":{"text":"receptor.pdbqt"},".outPorts>.port2>.port-body":{"port":{"id":"receptor.pdbqt","type":"out"}},".outPorts>.port2":{"ref":".body","ref-y":0.8333333333333333,"ref-dx":0}}},{"type":"devs.Model","size":{"width":100,"height":100},"inPorts":["ligands.zip","config.txt","receptor.pdbqt"],"outPorts":["output.tar"],"position":{"x":460,"y":80},"angle":0,"inPortsProps":{"ligands.zip":{"input_coll":false,"coll_filter":""},"config.txt":{"input_coll":false,"coll_filter":""},"receptor.pdbqt":{"input_coll":false,"coll_filter":""}},"outPortsProps":{"output.tar":{"output_gen":false,"generator_regexp":"","targetip":"","targetport":"","distribution":null}},"id":"d44fb879-3469-4e77-9b31-ed88ab381e83","z":2,"attrs":{".label":{"text":"Vina"},".exename":{"text":"vina.run"},".args":{"text":""},".exetgz":{"text":"https://www.dropbox.com/s/d7xyrrkiej1xhw6/vina_exe.tgz?dl=1"},".scaling":{"min":5,"max":5},"rect":{"fill":"green","stroke":"black","stroke-width":"1px"},".inPorts circle":{"fill":"#16A085","magnet":"passive","type":"input"},".outPorts circle":{"fill":"#E74C3C","type":"output"},".inPorts>.port0>.port-label":{"text":"ligands.zip"},".inPorts>.port0>.port-body":{"port":{"id":"ligands.zip","type":"in"}},".inPorts>.port0":{"ref":".body","ref-y":0.16666666666666666},".inPorts>.port1>.port-label":{"text":"config.txt"},".inPorts>.port1>.port-body":{"port":{"id":"config.txt","type":"in"}},".inPorts>.port1":{"ref":".body","ref-y":0.5},".inPorts>.port2>.port-label":{"text":"receptor.pdbqt"},".inPorts>.port2>.port-body":{"port":{"id":"receptor.pdbqt","type":"in"}},".inPorts>.port2":{"ref":".body","ref-y":0.8333333333333333},".outPorts>.port0>.port-label":{"text":"output.tar"},".outPorts>.port0>.port-body":{"port":{"id":"output.tar","type":"out"}},".outPorts>.port0":{"ref":".body","ref-y":0.5,"ref-dx":0}}},{"type":"devs.Model","size":{"width":100,"height":100},"inPorts":["output.tar"],"outPorts":["best.pdbqt"],"position":{"x":755,"y":80},"angle":0,"inPortsProps":{"output.tar":{"input_coll":true,"coll_filter":"output.tar_%i"}},"outPortsProps":{"best.pdbqt":{"output_gen":false,"generator_regexp":"","targetip":"155.210.198.89","targetport":"5000","distribution":null}},"id":"007fa52d-9743-46d7-9f78-a37ec22465f5","z":3,"attrs":{".label":{"text":"Collector"},".exename":{"text":"execute.bin"},".args":{"text":"5"},".exetgz":{"text":"https://www.dropbox.com/s/rf9h5kppah2y4s5/collector_exe.tgz?dl=1"},".scaling":{"min":1,"max":1},"rect":{"fill":"green","stroke":"red","stroke-width":"5px"},".inPorts circle":{"fill":"#16A085","magnet":"passive","type":"input"},".outPorts circle":{"fill":"#E74C3C","type":"output"},".inPorts>.port0>.port-label":{"text":"output.tar"},".inPorts>.port0>.port-body":{"port":{"id":"output.tar","type":"in"}},".inPorts>.port0":{"ref":".body","ref-y":0.5},".outPorts>.port0>.port-label":{"text":"best.pdbqt"},".outPorts>.port0>.port-body":{"port":{"id":"best.pdbqt","type":"out"}},".outPorts>.port0":{"ref":".body","ref-y":0.5,"ref-dx":0}}},{"type":"link","source":{"id":"7103b0d9-3306-4311-bcf0-248835ac3f67","selector":"g:nth-child(1) > g:nth-child(4) > g:nth-child(1) > circle:nth-child(1)","port":"output.zip"},"target":{"id":"d44fb879-3469-4e77-9b31-ed88ab381e83","port":"ligands.zip","selector":"g:nth-child(1) > g:nth-child(3) > g:nth-child(1) > circle:nth-child(1)"},"id":"4b8ebdb9-0392-4980-8a22-63353fac7ee2","embeds":"","z":4,"attrs":{".marker-target":{"d":"M 10 0 L 0 5 L 10 10 z"}}},{"type":"link","source":{"id":"7103b0d9-3306-4311-bcf0-248835ac3f67","selector":"g:nth-child(1) > g:nth-child(4) > g:nth-child(2) > circle:nth-child(1)","port":"config.txt"},"target":{"id":"d44fb879-3469-4e77-9b31-ed88ab381e83","port":"config.txt","selector":"g:nth-child(1) > g:nth-child(3) > g:nth-child(2) > circle:nth-child(1)"},"id":"22086820-897b-4fb4-a85b-60b1518ace32","embeds":"","z":5,"attrs":{".marker-target":{"d":"M 10 0 L 0 5 L 10 10 z"}}},{"type":"link","source":{"id":"7103b0d9-3306-4311-bcf0-248835ac3f67","selector":"g:nth-child(1) > g:nth-child(4) > g:nth-child(3) > circle:nth-child(1)","port":"receptor.pdbqt"},"target":{"id":"d44fb879-3469-4e77-9b31-ed88ab381e83","port":"receptor.pdbqt","selector":"g:nth-child(1) > g:nth-child(3) > g:nth-child(3) > circle:nth-child(1)"},"id":"54b9836f-6e85-4789-8454-cc8824322060","embeds":"","z":6,"attrs":{".marker-target":{"d":"M 10 0 L 0 5 L 10 10 z"}}},{"type":"link","source":{"id":"d44fb879-3469-4e77-9b31-ed88ab381e83","selector":"g:nth-child(1) > g:nth-child(4) > g:nth-child(1) > circle:nth-child(1)","port":"output.tar"},"target":{"id":"007fa52d-9743-46d7-9f78-a37ec22465f5","port":"output.tar","selector":"g:nth-child(1) > g:nth-child(3) > g:nth-child(1) > circle:nth-child(1)"},"id":"1652996e-52b7-45af-b684-a95e2f7d0a72","embeds":"","z":7,"attrs":{".marker-target":{"d":"M 10 0 L 0 5 L 10 10 z"}}}]}'));
  });

  $('#dlgraph').click(function() {
    function downloadInnerHtml(filename, elId, mimeType) {
      //var elHtml = document.getElementById(elId).innerHTML;
      var elHtml = JSON.stringify(graph.toJSON(), null, '\t');
      var link = document.createElement('a');
      mimeType = mimeType || 'text/plain';
      link.setAttribute('download', filename);
      link.setAttribute('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(elHtml));
      link.click();
    }
    var fileName =  'graph.json'; // You can use the .txt extension if you want
    downloadInnerHtml(fileName, 'invisible','application/json');
                    //If you don't want the link to actually
                    // redirect the browser to another page, then
                    // return false at the end of this block.
                    // Note that this also prevents event bubbling,
                    // which is probably what we want here, but won't
                    // always be the case.
    return false;
  });

  $('#dloccopus').click(function() {
    function downloadInnerHtml(filename, elId, mimeType) {
      //var elHtml = document.getElementById(elId).innerHTML;
      var elHtml = dumpoccopus();
      var link = document.createElement('a');
      mimeType = mimeType || 'text/plain';
      link.setAttribute('download', filename);
      link.setAttribute('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(elHtml));
      link.click();
    }
    var fileName =  'occopus.yaml'; // You can use the .txt extension if you want
    downloadInnerHtml(fileName, 'invisible','application/x-yaml');
                    //If you don't want the link to actually
                    // redirect the browser to another page, then
                    // return false at the end of this block.
                    // Note that this also prevents event bubbling,
                    // which is probably what we want here, but won't
                    // always be the case.
    return false;
  });

  $('#paperzoom').on('input change', function() {
    var newLevel = $('#paperzoom').val();
    paper.scale(newLevel/100, newLevel/100);
  });

  $('#input_coll').click(function() {
    $('#coll_filter').prop('disabled', !($('#input_coll').is(':checked')));
  });

  $('#output_gen').click(function() {
    $('#generator_regexp').prop('disabled', !($('#output_gen').is(':checked')));
    $('#distribution').prop('disabled', !($('#output_gen').is(':checked')));
  });

  var addJob = function(x, y) {
    jobpropdialog.x = x;
    jobpropdialog.y = y;
    jobpropdialog.cell = null;
    $('#jobname').val('');
    $('#exename').val('');
    $('#args').val('');
    $('#executabletgz').val('');
    $('#scalingmin').val('');
    $('#scalingmax').val('');
    updateJobPropButton();
    jobpropdialog.dialog('open');
  };

  var addPort = function(type) {
    var ports = selectedCell.model.get(type);
    if (ports == null)
      ports = [type+''];
    else
      ports.push(type + ports.length);
    var name = ports[ports.length-1];
    var propKey = (type == 'inPorts' ? 'inPortsProps' : 'outPortsProps');
    var portsProps = selectedCell.model.get(propKey);
    portsProps[name] = {};
    selectedCell.model.set(propKey, portsProps);
    portURLMap = selectedCell.model.get(type + 'URLs');
    selectedCell.model.set(type, ports);
    selectedCell.model.trigger('change:' + type);
    graph.trigger('change');
  };

  function dumpoccopus() {
    graphJSON = graph.toJSON();
    var cells = graph.getCells();
    var links = graph.getLinks();
    nodes = {};
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      if (cell.get('type') == 'link')
        continue;
      var name = cell.attr('.label/text');
      var args = cell.attr('.args/text');
      var exetgz = cell.attr('.exetgz/text');
      var scalingmin = cell.attr('.scaling/min');
      var scalingmax = cell.attr('.scaling/max');
      scalingmin = (scalingmin == null) ? 1 : scalingmin;
      scalingmax = (scalingmax == null) ? 1 : scalingmax;
      var celljson = {
        name: name,
        type: "jobflow_node",
        scaling: {
          min: scalingmin,
          max: scalingmax
        },
        variables: {
          jobflow: {
            app: {
              exe: {
                filename: name,
                tgzurl: exetgz
              },
              args: args
            }
          }
        }
      };
      var inPorts = cell.get('inPorts');
      if (inPorts.length) {
        var inports = [];
        var inPortsProps = cell.get('inPortsProps');
        for (var j = 0; j < inPorts.length; j++) {
          var portName = inPorts[j];
          var portJSON = {
            name: portName
          };
          var input_coll = inPortsProps[portName]['input_coll'];
          var coll_filter = inPortsProps[portName]['coll_filter'];
          if (input_coll) {
            portJSON['collector'] = true;
            portJSON['format'] = coll_filter;
          }
          inports[j] = portJSON;
        }
        celljson['variables']['jobflow']['app']['in'] = inports;
      }
      var outPorts = cell.get('outPorts');
      if (outPorts.length) {
        var outports = [];
        var outPortsProps = cell.get('outPortsProps');
        for (var j = 0; j < outPorts.length; j++) {
          var portName = outPorts[j];
          var portJSON = {
            name: portName
          };
          if (outPortsProps[portName]) {
            var output_gen = outPortsProps[portName]['output_gen'];
            var generator_regexp = outPortsProps[portName]['generator_regexp'];
            var targetip = outPortsProps[portName]['targetip'];
            var targetport = outPortsProps[portName]['targetport'];
            var distribution = outPortsProps[portName]['distribution'];
            if (output_gen) {
              portJSON['filter'] = generator_regexp;
            }
            portJSON['targetip'] = targetip;
            portJSON['targetport'] = targetport;
          }
          outports[j] = portJSON;
        }
        celljson['variables']['jobflow']['app']['out'] = outports;
      }
      nodes[name] = celljson;
    }
    var dependencies = {};
    var depset = new Set();
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var scell = link.getSourceElement();
      var tcell = link.getTargetElement();
      var scellname = scell.attr('.label/text');
      var tcellname = tcell.attr('.label/text');
      var sportname = link.get('source').port;
      var tportname = link.get('target').port;
      depset.add(scellname);
      if (dependencies[scellname] == undefined)
        dependencies[scellname] = new Set();
      celldeps = dependencies[scellname];
      celldeps.add(tcellname);
      dependencies[scellname] = celldeps;
      var outprefs = nodes[scellname]['variables']['jobflow']['app']['out'];
      for (var j = 0; j < outprefs.length; j++) {
        var outpref = outprefs[j];
        if (outpref['name'] != sportname)
          continue;
        delete outpref['targetip'];
        delete outpref['targetport'];
        outpref['targetname'] = tportname;
        outpref['targetnode'] = tcellname;
        nodes[scellname]['variables']['jobflow']['app']['out'][j] = outpref;
      }
    }
    var finaldeps = []
    for (let sname of depset) {
      var depset = dependencies[sname];
      for (let item of depset) {
        finaldeps.push('connection: [ *'+sname+', *'+item+' ]');
      }
    }
    occopusjson = {
      infra_id: '',
      user_id: '',
      name: '',
      nodes: nodes,
      dependencies: finaldeps
    };
    return jsyaml.dump(occopusjson);
  };

  $('#dumpoccopus').click(function() {
    console.log(dumpoccopus());
  });

});
