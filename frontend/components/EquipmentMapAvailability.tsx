import { StyleSheet} from "react-native";
import { Rect, Image, RectProps } from "react-native-svg";

type EquipmentMapAvailability = RectProps & {
    equipmentImage: any,
    availabilityColor: string
}

// e.g. <EquipmentMapAvailability equipmentImage={require('@/assets/images/bicepcurl-machine.png')} availabilityColor="red" />
export default function EquipmentMapAvailability({
    x,
    y,
    equipmentImage, 
    availabilityColor,
    ...rest
}: EquipmentMapAvailability) {
    return (
        <>
            <Rect x={x} y={y} width={22} height={13} fill={'grey'} rx={5} ry={5} {...rest} />
            <Image x={x+1} y={y+1} width={11} height={11} rx={11} ry={11} href={equipmentImage} />
            <Rect x={x+13} y={y+3} width={7} height={7} rx={12} ry={12} fill={availabilityColor ?? "red"}></Rect>
        </>
    );
}

const styles = StyleSheet.create({
    icon: {
        width: 45,
        height: 24,
        backgroundColor: 'gray',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    availability: {
        width: 13,
        height: 13,
        borderRadius: 25,
    }
})