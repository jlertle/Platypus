/**
# COMPONENT **logic-portable**
This component allows this entity to be carried by other entities with which it collides. Entities that should carry this entity need to have a [[Logic-Carrier]] component attached.

## Dependencies:
- [[handler-logic]] (on parent entity) - This component listens for 'handle-logic' messages to determine whether it should be carried or released each game step.
- [[logic-carrier]] (on peer entity) - This component triggers 'carry-me' and 'release-me' message, listened for by [[Logic-Carrier]] to handle carrying this entity.

## Messages

### Listens for:
- **handle-logic** - On receiving this message, this component triggers 'carry-me' or 'release-me' if its connection to a carrying entity has changed.
- **hit-solid** - On receiving this message, this component determines whether it is hitting its carrier or another entity. If it is hitting a new carrier, it will broadcast 'carry-me' on the next game step.
  - @param message.entity ([[Entity]]) - The entity with which the collision occurred.
  - @param message.x (number) - -1, 0, or 1 indicating on which side of this entity the collision occurred: left, neither, or right respectively.
  - @param message.y (number) - -1, 0, or 1 indicating on which side of this entity the collision occurred: top, neither, or bottom respectively.

### Peer Broadcasts
- **carry-me** - This message is triggered on a potential carrying peer, notifying the peer that this entity is portable.
  - @param message.entity ([[Entity]]) - This entity, requesting to be carried.
- **release-me** - This message is triggered on the current carrier, notifying them to release this entity.
  - @param message.entity ([[Entity]]) - This entity, requesting to be released.

## JSON Definition:
    {
      "type": "logic-portable",

      "portableDirections": {down: true}
      // This is an object specifying the directions that this portable entity can be carried on. Default is {down:true}, but "up", "down", "left", and/or "right" can be specified as object properties set to `true`.
    }
*/
(function(){
	return platformer.createComponentClass({
		id: 'logic-portable',
		constructor: function(definition){
			this.portableDirections = definition.portableDirections || {
				down: true //default is false, 'true' means as soon as carrier is connected downward
			};
	
	        this.carrier      = this.lastCarrier = undefined;
	        this.message      = {
	        	entity: this.owner
	        };
		},
		events:{
			"handle-logic": function(resp){
				if(this.carrierConnected){
					if(this.carrier != this.lastCarrier){
						if(this.lastCarrier){
							this.lastCarrier.trigger('release-me', this.message);
						}
						this.carrier.trigger('carry-me', this.message);
					}
					
					this.carrierConnected = false;
				} else {
					if(this.carrier){
						this.carrier.trigger('release-me', this.message);
						this.carrier = undefined;
					}
				}
				this.lastCarrier = this.carrier;
			},
			"hit-solid": function(collisionInfo){
				if(collisionInfo.y > 0){
					this.updateCarrier(collisionInfo.entity, 'down');
				} else if(collisionInfo.y < 0){
					this.updateCarrier(collisionInfo.entity, 'up');
				} else if(collisionInfo.x < 0){
					this.updateCarrier(collisionInfo.entity, 'left');
				} else if(collisionInfo.x > 0){
					this.updateCarrier(collisionInfo.entity, 'right');
				}
			}
		},
		methods: {
			updateCarrier: function(entity, direction){
				if(this.portableDirections[direction]){
					if(entity){
						if (entity !== this.carrier){
							this.carrier = entity;
						}
						this.carrierConnected = true;
					}
				}
			}
		}
	});
})();
