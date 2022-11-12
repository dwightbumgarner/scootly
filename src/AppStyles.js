import { Platform, StyleSheet, Dimensions } from "react-native";
import { Configuration } from "./Configuration";

export const { width, height } = Dimensions.get("window");
const SCREEN_WIDTH = width < height ? width : height;
const numColumns = 2;

export const AppStyles = {
  color: {
    // From Figma
    primarybg: "#1D1D1D",
    secondarybg: "#313131",
    accent: "#FBD85D",
    text: "#FEFBF0",
    grey: "#313131",
    secondarytext: "#B5AF9C",

    // From template
    main: "#5ea23a",
    title: "#464646",
    subtitle: "#545454",
    categoryTitle: "#161616",
    tint: "#FBD85D",
    description: "#bbbbbb",
    filterTitle: "#8a8a8a",
    starRating: "#2bdf85",
    location: "#a9a9a9",
    white: "white",
    facebook: "#4267b2",
    greenBlue: "#00aea8",
    placeholder: "#a0a0a0",
    background: "#1D1D1D",
    blue: "#3293fe"
  },
  fontFamily: {
    bold: 'Satoshi-Bold',
    regular: 'Satoshi-Regular'
  },
  fontSize: {
    mainTitle: 32,
    title: 24,
    content: 20,
    normal: 16,
    small: 12
  },
  buttonWidth: {
    main: "35%"
  },
  textInputWidth: {
    main: "80%"
  },
  borderRadius: {
    main: 10,
    small: 5
  }
};

export const AppIcon = {
  container: {
    backgroundColor: "#1D1D1D",
    borderRadius: 20,
    padding: 8,
    marginRight: 10
  },
  style: {
    tintColor: AppStyles.color.tint,
    width: 25,
    height: 25
  },
  images: {
    home: require("../assets/icons/home.png"),
    defaultUser: require("../assets/icons/user_profile.png"),
    logout: require("../assets/icons/shutdown.png"),
    menu: require("../assets/icons/menu.png"),
    defaultProfile: require("../assets/icons/profile_image_default.png"),
  }
};

export const HeaderButtonStyle = StyleSheet.create({
  multi: {
    flexDirection: "row"
  },
  container: {
    padding: 10
  },
  image: {
    justifyContent: "center",
    width: 35,
    height: 35,
    margin: 6
  },
  rightButton: {
    color: AppStyles.color.tint,
    marginRight: 10,
    fontWeight: "normal",
  }
});

export const ListStyle = StyleSheet.create({
  title: {
    fontSize: 16,
    color: AppStyles.color.subtitle,
    fontWeight: "bold"
  },
  subtitleView: {
    minHeight: 55,
    flexDirection: "row",
    paddingTop: 5,
    marginLeft: 10
  },
  leftSubtitle: {
    flex: 2
  },
  avatarStyle: {
    height: 80,
    width: 80
  }
});
