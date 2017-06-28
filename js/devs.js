Array.prototype.remove = function () {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

$(document).ready(function () {

  var selectedCell;
  var selectedPort;
  var selectedPortType;

  var graph = new joint.dia.Graph;

  var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: $('#paper').width(),
    height: $('#paper').height(),
    gridSize: 5,
    model: graph,
    //snapLinks: true,
    //embeddingMode: false,
    linkPinning: false,
    interactive: true,
    defaultLink: new joint.dia.Link({
      attrs: {
        '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' }
      }
    }),
    validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
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
      'Set job properties': function () {
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
            size: { width: 100, height: 100 },
            inPorts: [],
            inPortsProps: {},
            outPorts: [],
            outPortsProps: {},
            attrs: {
              '.label': { text: name },
              '.exename': { text: exename },
              '.args': { text: args },
              '.exetgz': { text: exetgz },
              '.scaling': { min: scalingmin, max: scalingmax },
              rect: { fill: 'green' },
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
      Cancel: function () {
        jobpropdialog.dialog('close');
      }
    },
  });

  var inportpropdialog = $('#inportpropdialog').dialog({
    autoOpen: false,
    width: 350,
    modal: true,
    buttons: {
      'Update port properties': function () {
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
      Cancel: function () {
        inportpropdialog.dialog('close');
      }
    },
  });

  var outportpropdialog = $('#outportpropdialog').dialog({
    autoOpen: false,
    width: 350,
    modal: true,
    buttons: {
      'Update port properties': function () {
        var oldName = selectedPort;
        var output_gen = $('#output_gen').is(':checked');
        var generator_regexp = $('#generator_regexp').val();
        var targetname = $('#targetname').val();
        var targetip = $('#targetip').val();
        var targetport = $('#targetport').val();
        var distribution = $('#distribution').val();
        var flowbsterName = $('#flowbsterName').val();
        var outPortsProps = selectedCell.model.get('outPortsProps');
        var portprops = {
          'output_gen': output_gen,
          'generator_regexp': generator_regexp,
          'targetname': targetname,
          'targetip': targetip,
          'targetport': targetport,
          'distribution': distribution,
          'flowbsterName': flowbsterName
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
      Cancel: function () {
        outportpropdialog.dialog('close');
      }
    },
  });

  var workflowpropdialog = $('#workflowpropdialog').dialog({
    autoOpen: false,
    width: 350,
    modal: true,
    buttons: {
      'Update workflow properties': function () {
        var infra_id = $('#infra_id').val();
        var user_id = $('#user_id').val();
        var wf_name = $('#wf_name').val();
        var coll_ip = $('#coll_ip').val();
        var coll_port = $('#coll_port').val();
        var recv_port = $('#recv_port').val();
        var nodetypename = $('#nodetypename').val();
        graph.set('infra_id', infra_id);
        graph.set('user_id', user_id);
        graph.set('wf_name', wf_name);
        graph.set('coll_ip', coll_ip);
        graph.set('coll_port', coll_port);
        graph.set('recv_port', recv_port);
        graph.set('nodetypename', nodetypename);
        workflowpropdialog.dialog('close');
      },
      Cancel: function () {
        workflowpropdialog.dialog('close');
      }
    },
  });

  $('#jobname').on('input change', function () {
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
    'cell:highlight': function (cellView, el, opt) {
      if (opt.embedding) {
        V(el).addClass('highlighted-parent');
      }
      if (opt.connecting) {
        var bbox = V(el).bbox(false, paper.viewport);
        highlighter.translate(bbox.x + 10, bbox.y + 10, { absolute: true });
        V(paper.viewport).append(highlighter);
      }
    },
    'cell:unhighlight': function (cellView, el, opt) {
      if (opt.embedding) {
        V(el).removeClass('highlighted-parent');
      }
      if (opt.connecting) {
        highlighter.remove();
      }
    }
  });

  paper.on('all', function (eventName, cell) {
    console.log(arguments);
  });

  var selectCell = function (cell) {
    if (cell != null) {
      if (selectedCell != null) {
        selectedCell.model.attr('rect/stroke', 'black');
        selectedCell.model.attr('rect/stroke-width', '1px');
      }
      //mark
      if (cell.model != undefined) {
        selectedCell = cell;
        selectedCell.model.attr('rect/stroke', 'red');
        selectedCell.model.attr('rect/stroke-width', '5px');
      }
    } else {
      console.log('What happened');
    }

  };

  paper.on('cell:pointerup', function (cell, eventName, x, y) {
    console.log(cell);
    console.log(eventName);
    var portName = eventName.target.getAttribute('port');
    if (portName != null) {
      selectedPort = portName;
      selectedPortType = eventName.target.getAttribute('type');
      if (cell.sourceView != null) {
        var jobname = cell.sourceView.model.attr('.label/text');
        selectCell(cell.sourceView);
        console.log('About to define data for ' + selectedPortType + ' port \'' + portName + '\' for job ' + jobname);
      } else {
        console.log('CELL INFOO');
        console.log(cell);
      }

      if ("input" != selectedPortType) {
        $('#outportname').val(portName);
        var targetname = '';
        var targetip = '';
        var targetport = '';
        var output_gen = false;
        var generator_regexp = '';
        var distribution = 'random';
        var flowbsterName = '';
        if (undefined != cell.sourceView.model.get('outPortsProps')[portName]) {
          targetname = cell.sourceView.model.get('outPortsProps')[portName]['targetname'];
          targetip = cell.sourceView.model.get('outPortsProps')[portName]['targetip'];
          targetport = cell.sourceView.model.get('outPortsProps')[portName]['targetport'];
          output_gen = cell.sourceView.model.get('outPortsProps')[portName]['output_gen'];
          generator_regexp = cell.sourceView.model.get('outPortsProps')[portName]['generator_regexp'];
          distribution = cell.sourceView.model.get('outPortsProps')[portName]['distribution'];
          flowbsterName = cell.sourceView.model.get('outPortsProps')[portName]['flowbsterName'];
        };
        $('#output_gen').prop('checked', output_gen);
        $('#targetname').val(targetname);
        $('#targetip').val(targetip);
        $('#targetport').val(targetport);
        $('#generator_regexp').val(generator_regexp);
        $('#distribution').val(distribution);
        $('#generator_regexp').prop('disabled', !output_gen);
        $('#distribution').prop('disabled', !output_gen);
        $('#flowbsterName').val(flowbsterName);
        outportpropdialog.dialog('open');
      }
    };
  });

  paper.on('cell:pointerclick', function (cell, eventName, x, y) {
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
        var targetname = '';
        var targetip = '';
        var targetport = '';
        var output_gen = false;
        var generator_regexp = '';
        var distribution = 'random';
        if (undefined != cell.model.get('outPortsProps')[portName]) {
          targetname = cell.model.get('outPortsProps')[portName]['targetname'];
          targetip = cell.model.get('outPortsProps')[portName]['targetip'];
          targetport = cell.model.get('outPortsProps')[portName]['targetport'];
          output_gen = cell.model.get('outPortsProps')[portName]['output_gen'];
          generator_regexp = cell.model.get('outPortsProps')[portName]['generator_regexp'];
          distribution = cell.model.get('outPortsProps')[portName]['distribution'];
        };
        $('#output_gen').prop('checked', output_gen);
        $('#targetname').val(targetname);
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

  paper.on('cell:pointerdblclick', function (cell, eventName, x, y) {
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

  paper.on('blank:pointerclick', function (eventName, x, y) {
    addJob(x, y);
  });

  $("#deljobbutton").click(function () {
    selectedCell.model.remove();
    selectedCell = null;
  });

  $("#addinportbutton").click(function () {
    addPort('inPorts');
  });

  $("#addoutportbutton").click(function () {
    addPort('outPorts');
  });

  $("#delportbutton").click(function () {
    var type = (selectedPortType == 'output' ? 'outPorts' : 'inPorts');
    var ports = selectedCell.model.get(type);
    ports.remove(selectedPort);
    selectedCell.model.set(type, ports);
    selectedCell.model.trigger('change:' + type);
  });

  $("#wfpropbutton").click(function () {
    workflowpropdialog.dialog('open');
    $('#infra_id').val(graph.get('infra_id'));
    $('#user_id').val(graph.get('user_id'));
    $('#wf_name').val(graph.get('wf_name'));
    $('#coll_ip').val(graph.get('coll_ip'));
    $('#coll_port').val(graph.get('coll_port'));
    $('#recv_port').val(graph.get('recv_port'));
    $('#nodetypename').val(graph.get('nodetypename'));
  });

  $("#dumpgraphbutton").click(function () {
    console.log('Graph\'s JSON is:\n' + JSON.stringify(graph.toJSON(), null, '\t'));
  });

  $('#dlgraph').click(function () {
    function downloadInnerHtml(filename, elId, mimeType) {
      //var elHtml = document.getElementById(elId).innerHTML;
      var elHtml = JSON.stringify(graph.toJSON());
      var link = document.createElement('a');
      mimeType = mimeType || 'text/plain';
      link.setAttribute('download', filename);
      link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(elHtml));
      link.click();
    }
    var fileName = 'graph.json'; // You can use the .txt extension if you want
    downloadInnerHtml(fileName, 'invisible', 'application/json');
    return false;
  });

  $('#dloccopus').click(function () {
    function downloadInnerHtml(filename, elId, mimeType) {
      //var elHtml = document.getElementById(elId).innerHTML;
      var elHtml = dumpoccopus();
      var link = document.createElement('a');
      mimeType = mimeType || 'text/plain';
      link.setAttribute('download', filename);
      link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(elHtml));
      link.click();
    }
    var fileName = 'occopus.yaml'; // You can use the .txt extension if you want
    downloadInnerHtml(fileName, 'invisible', 'application/x-yaml');
    return false;
  });

  $('#fileinput').change(function () {
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = (function (theFile) {
      return function (e) {
        console.log(e);
        graph.fromJSON(JSON.parse(e.target.result));
      };
    })(file);
    reader.readAsText(file);
  });

  $('#paperzoom').on('input change', function () {
    var newLevel = $('#paperzoom').val();
    paper.scale(newLevel / 100, newLevel / 100);
  });

  $('#input_coll').click(function () {
    $('#coll_filter').prop('disabled', !($('#input_coll').is(':checked')));
  });

  $('#output_gen').click(function () {
    $('#generator_regexp').prop('disabled', !($('#output_gen').is(':checked')));
    $('#distribution').prop('disabled', !($('#output_gen').is(':checked')));
  });

  var addJob = function (x, y) {
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

  var addPort = function (type) {
    var ports = selectedCell.model.get(type);
    if (ports == null)
      ports = [type + ''];
    else
      ports.push(type + ports.length);
    var name = ports[ports.length - 1];
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
      var exename = cell.attr('.exename/text');
      var scalingmin = cell.attr('.scaling/min');
      var scalingmax = cell.attr('.scaling/max');
      scalingmin = (scalingmin == null) ? 1 : scalingmin;
      scalingmax = (scalingmax == null) ? 1 : scalingmax;
      var celljson = {
        name: name,
        type: graph.get('nodetypename'),
        scaling: {
          min: scalingmin,
          max: scalingmax
        },
        variables: {
          flowbster: {
            app: {
              exe: {
                filename: exename,
                tgzurl: exetgz
              },
              args: '\"' + args + '\"' // " " needed
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
            portJSON['format'] = '\\' + coll_filter + '\\'; // " " needed
          }
          inports[j] = portJSON;
        }
        celljson['variables']['flowbster']['app']['in'] = inports;
      }
      var outPorts = cell.get('outPorts');

      if (outPorts.length) {
        var outports = [];
        var outPortsProps = cell.get('outPortsProps');
        for (var j = 0; j < outPorts.length; j++) {
          var portName = outPorts[j];
          var portJSON = {};
          if (outPortsProps[portName]) {
            var flowbsterName = outPortsProps[portName]['flowbsterName'];
            var output_gen = outPortsProps[portName]['output_gen'];
            var generator_regexp = outPortsProps[portName]['generator_regexp'];
            var targetname = outPortsProps[portName]['targetname'];
            var targetip = outPortsProps[portName]['targetip'];
            if (targetip == undefined)
              targetip = graph.get('coll_ip');
            var targetport = outPortsProps[portName]['targetport'];
            if (targetport == undefined)
              targetport = graph.get('coll_port');
            var distribution = outPortsProps[portName]['distribution'];
            portJSON['name'] = flowbsterName;
            if (output_gen) {
              portJSON['filter'] = '\\' + generator_regexp + '\\'; // " " needed
              if (distribution)
                portJSON['distribution'] = distribution; //distribution was missin'
            }

            portJSON['displayName'] = portName;
            portJSON['targetname'] = targetname;
            portJSON['targetip'] = targetip;
            portJSON['targetport'] = targetport;
          }
          outports[j] = portJSON;
        }
        celljson['variables']['flowbster']['app']['out'] = outports;
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
      var outprefs = nodes[scellname]['variables']['flowbster']['app']['out'];
      for (var j = 0; j < outprefs.length; j++) {
        var outpref = outprefs[j];
        if (outpref['displayName'] != sportname) {
          continue;
        }
        delete outpref['targetname'];
        delete outpref['targetip'];
        delete outpref['targetport'];
        delete outpref['displayName'];
        outpref['targetname'] = tportname;
        outpref['targetnode'] = tcellname;
        nodes[scellname]['variables']['flowbster']['app']['out'][j] = outpref;
      }
    }
    var nodeList = [];
    var idx = 0;
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      if (cell.get('type') == 'link')
        continue;
      var name = cell.attr('.label/text');
      nodeList[idx++] = nodes[name];
    }

    //delete displayName for those nodes which doesnt have a link
    // and delete the targetIP targetPort if not specified
    for (let node of nodeList) {
      for (let outport of node['variables']['flowbster']['app']['out']) {
        if (outport['displayName'])
          delete outport['displayName'];
        if (!outport['targetip'] && !outport['targetport']) {
          delete outport['targetip'];
          delete outport['targetport'];
        }
      }
    }

    var finaldeps = []
    for (let sname of depset) {
      var depset = dependencies[sname];
      for (let item of depset) {
        finaldeps.push('connection: [ *' + sname + ', *' + item + ' ]');
      }
    }

    var collector_ip = '&collectorip ' + graph.get('coll_ip');
    console.log(collector_ip);
    var collector_port = '&collectorport ' + graph.get('coll_port');
    console.log(collector_port);
    var receiver_port = '&receiverport ' + graph.get('recv_port');
    console.log(receiver_port);

    occopusjson = {
      user_id: graph.get('user_id'),
      infra_name: graph.get('wf_name'),
      variables: {
        flowbster_global: {
          collector_ip: collector_ip,
          collector_port: collector_port,
          receiver_port: receiver_port
        }
      },
      nodes: nodeList,
      dependencies: finaldeps
    };

    var names = [];
    var subNames = [];
    var index = 0;
    for (let node of occopusjson.nodes) {
      names[index] = node.name;
      subNames[index] = 'name: ' + node.name;
      index++;
    }

    // console.log(names);
    // console.log(subNames);

    var halfwayYaml = jsyaml.dump(occopusjson, { lineWidth: -1, noCompatMode: true });

    for (i = 0; i < names.length; i++) {
      var firstPart = halfwayYaml.slice(0, halfwayYaml.indexOf(subNames[i]));
      halfwayYaml = firstPart + '&' + names[i] + '\n    ' + halfwayYaml.slice(halfwayYaml.indexOf(subNames[i]));
    }

    //console.log(halfwayYaml);
    //console.log('--');

    //replace sinle quotes globally to whitespace and " to single quotation marks
    var doneYaml = halfwayYaml.replace(/'/g, ' ').replace(/"/g, '\'').replace(/\\/g, '\"');

    //console.log(doneYaml);
    return doneYaml;
  };

  $('#dumpoccopus').click(function () {
    console.log(dumpoccopus());
  });

});
