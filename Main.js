import React, { Component } from 'react'
import { ScrollView, TouchableOpacity, View, Text, TextInput, StyleSheet, Button } from 'react-native'
import { useQuery, gql } from '@apollo/client'

const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

//CHANGE THIS VARIABLE
const ipAdd = '192.168.1.160'

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch(`http://${ipAdd}:3000/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ query, variables })
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code == 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    console.log(result.data)
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}

export default class Main extends Component {
  constructor() {
    super()
    this.state = {
      guests: [],
      name: '',
      contact: "",
      refresh: true
    }
    this.updateName = this.updateName.bind(this)
    this.updateContact = this.updateContact.bind(this)
    this.addGuest = this.addGuest.bind(this);
    this.removeGuest = this.removeGuest.bind(this);
  }
  updateName(name) {
    if (name !== '') {
      this.setState({ name })
    }
  }
  updateContact(contact) {
    if (contact !== '') {
      this.setState({ contact })
    }
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      guestList {
        id name contact arrival
      }
    }`;

    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ guests: data.guestList });
      this.state.guests.map(async (guest, key) => {
        const updQuery = `mutation guestUpdate($id1: Int!, $id2: Int!) {
          guestUpdate(oldId: $id1, newId: $id2)
        }`;
        var id2 = key+1
        var id1 = guest.id
        await graphQLFetch(updQuery, { id1, id2 });
      });
    }
    
    const updData = await graphQLFetch(query);
    if (updData) {
      this.setState({ guests: updData.guestList });
    }
  }

  async addGuest() {
    let guest = {
      name: this.state.name, contact: this.state.contact, remove: 'Remove'
    }
    let guestExists = false
    for (var i=0; i < this.state.guests.length; i++) {
      if (this.state.guests[i].contact == guest.contact) {
        guestExists = true;
        alert('This guest is already on the waitlist!');
        return;
      }
    }
    if (this.state.guests.length < 25 && guestExists == false) {
      const query = `mutation guestAdd($guest: GuestInputs!) {
        guestAdd(guest: $guest) {
          id
        }
      }`;
      const data = await graphQLFetch(query, { guest });
      if (data) {
        this.loadData();
      }
    } else {
      alert('Waitlist is Full!');
    }
    this.setState({name: "", contact: ""})
  }

  async removeGuest(guestID) {
    var validId = false;
    const id = parseInt(guestID);
    for (var i=0; i < this.state.guests.length; i++) {
      if (this.state.guests[i].id === id) {
        validId = true;
      }
    }
    if (validId === true) {
      const query = `mutation guestRemove($id: Int!) {
        guestRemove(id: $id) 
      }`;
      const data = await graphQLFetch(query, { id });
      if (data) {
        this.setState({refresh: true});
        this.loadData();
        this.setState({refresh: false});
      }
    } else {
      alert('No such ID!');
    }
  }

  render () {
    const ViewList = () => {
      return this.state.guests.map((guest) => {
        console.log(guest)
        return (
          <TouchableOpacity key={guest.contact} style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{marginTop: 7}}>{guest.id}</Text>
            <Text style={{marginTop: 7}}>{guest.name}</Text>
            <Text style={{marginTop: 7}}>{guest.contact}</Text>
            <Text style={{marginTop: 7}}>{new Date(Date.parse(guest.arrival)).toLocaleTimeString('en-US')}</Text>
            <Button title="Remove" onPress={() => this.removeGuest(guest.id)}/>
          </TouchableOpacity>
        )
      })
    }

    return (
      <View style={styles.container}>
        <Text style={{textAlign: 'left', fontWeight: 'bold', paddingTop: 20}}>Current Waiting List</Text>
        <Text style={{textAlign: 'right'}}>{this.state.guests.length} Guests, {25-this.state.guests.length} Slots</Text>
        <TouchableOpacity style={{paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={{fontWeight: 'bold'}}>ID</Text>
          <Text style={{fontWeight: 'bold'}}>Name</Text>
          <Text style={{fontWeight: 'bold'}}>Contact</Text>
          <Text style={{fontWeight: 'bold'}}>Arrival</Text>
          <Text style={{fontWeight: 'bold'}}>---------------</Text>
        </TouchableOpacity>
        <ScrollView style={{ paddingVertical: 10, flex: 1, minHeight: 150 }}>
          <ViewList />
        </ScrollView>

        <Text style={{textAlign: 'center', fontWeight: 'bold', marginBottom: 10}}>Add Guest</Text>
        <TextInput
          placeholder="Name"
          value={this.state.name}
          onChangeText={this.updateName}
          style={styles.input} />
        <TextInput
          placeholder="Contact No"
          value={this.state.contact}
          onChangeText={this.updateContact}
          style={styles.input} />
        <Button style={{ width: 50 }} title="Add" onPress={this.addGuest} />
        <Text style={{textAlign: 'right', fontStyle: 'italic', paddingTop: 15 }}>Powered By: ArvindS (A0228522J)</Text>
      </View>
    )
  }
}

styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15
  },
  head: { height: 40, backgroundColor: '#f1f8ff' },
  text: { margin: 6 },
  input: {
    backgroundColor: '#dddddd',
    height: 40,
    marginBottom: 10,
    paddingLeft: 10
  }
})
